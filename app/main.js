const { ipcMain, electron, app, BrowserWindow, Menu, dialog } = require('electron');
const windowStateKeeper = require('electron-window-state');
const fs = require('fs');
const settings = require('electron-settings');
const i18n = require("i18n");
const { autoUpdater } = require("electron-updater");
const os = require('os');

let mainWindow;
let mainWindowState;

autoUpdater.autoDownload = false;

if (!fs.existsSync(os.homedir() + "/Documents/todolist-electron")) {
    fs.mkdirSync(os.homedir() + "/Documents/todolist-electron");
    fs.writeFile(os.homedir() + "/Documents/todolist-electron/project_list.json", "", (err) => {
        if (err) {
            throw err;
        }
    });
} else {
    if (!fs.existsSync(os.homedir() + "/Documents/todolist-electron/project_list.json")) {
        fs.writeFile(os.homedir() + "/Documents/todolist-electron/project_list.json", "", (err) => {
            if (err) {
                throw err;
            }
        });
    }
}

app.on('ready', function() {
    if (!settings.has('lang')) {
        settings.set('lang', "fr");
    }

    if (!settings.has('dev')) {
        settings.set('dev', false);
    }

    if (!settings.has('theme')) {
        settings.set('theme', "purple");
    }

    i18n.configure({
        directory: __dirname + '/locales/fr/'
    });

    createWindow();

    autoUpdater.checkForUpdates();

});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (mainWindow === null) {
        createWindow();
    }
});

ipcMain.on('change-page', function(event, arg) {
    let page_name = arg.name;
    mainWindow.webContents.loadURL(`file://${__dirname}/html/${page_name}.html`);
    if (page_name == "project") {
        ipcMain.once('getproject', (evente, arga) => {
            evente.returnValue = arg.project_id;
        });
    }
});

ipcMain.on('change-dev', function(event, arg) {
    let dev_is = arg.dev;
    if (dev_is) {
        mainWindow.webContents.openDevTools();
    } else {
        mainWindow.webContents.closeDevTools();
    }
});

function OpenAboutWindow(win) {

    let aboutwin = new BrowserWindow({
        width: 350,
        height: 400,
        parent: win,
        modal: true,
        show: false,
        resizable: false,
        minimizable: false,
        maximizable: false
    });

    aboutwin.loadURL(`file://${__dirname}/html/about.html`);
    aboutwin.setMenu(null);

    aboutwin.once('ready-to-show', () => {
        aboutwin.show();
    });

    if (settings.get('dev')) {
        aboutwin.webContents.openDevTools();
    }

}

function createWindow() {

    mainWindowState = windowStateKeeper({
        defaultWidth: 1300,
        defaultHeight: 800
    });

    let backgroundColor = '#312450';

    if (settings.has('theme')) {
        switch (settings.get('theme')) {
            case 'purple':
                backgroundColor = '#312450';
                break;
            case 'blue':
                backgroundColor = '#233550';
                break;
            case 'green':
                backgroundColor = '#48A440';
                break;
            default:
                backgroundColor = '#312450';
        }
    }

    mainWindow = new BrowserWindow({
        x: mainWindowState.x,
        y: mainWindowState.y,
        width: mainWindowState.width,
        height: mainWindowState.height,
        minWidth: 1300,
        minHeight: 800,
        backgroundColor: backgroundColor,
        show: false
    });

    let template = [{
        label: i18n.__({ phrase: "menu_file", locale: "general" }),
        submenu: [{
            label: i18n.__({ phrase: "menu_file_exit", locale: "general" }),
            accelerator: 'Alt+F4',
            click() {
                app.quit();
            }
        }]
    }, {
        label: '?',
        submenu: [{
                label: i18n.__({ phrase: "menu_Other_update", locale: "general" }),
                accelerator: 'CmdOrCtrl+U',
                click(menuItem, currentWindow) {
                    autoUpdater.checkForUpdates();
                }
            },
            {
                label: i18n.__({ phrase: "menu_Other_info", locale: "general" }),
                accelerator: 'CmdOrCtrl+I',
                click(menuItem, currentWindow) {
                    OpenAboutWindow(mainWindow);
                }
            }
        ],
        label: 'Edit',
        submenu: [
          { role: 'undo' },
          { role: 'redo' },
          { type: 'separator' },
          { role: 'cut' },
          { role: 'copy' },
          { role: 'paste' },
          { role: 'pasteandmatchstyle' },
          { role: 'delete' },
          { role: 'selectall' }
        ]
    }];

    Menu.setApplicationMenu(Menu.buildFromTemplate(template));

    mainWindow.loadURL(`file://${__dirname}/html/home.html`);

    mainWindow.once('ready-to-show', () => {
        mainWindowState.manage(mainWindow);
        mainWindow.show();
    });

    if (settings.get('dev')) {
        mainWindow.webContents.openDevTools();
    }

    mainWindow.on('close', () => {
        mainWindowState.saveState(mainWindow);
    });

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

autoUpdater.on('update-available', (ev, info) => {
    dialog.showMessageBox({
        type: "info",
        title: i18n.__({ phrase: "update_available_title", locale: "general" }),
        message: i18n.__({ phrase: "update_available_message_one", locale: "general" }) + ev.version + i18n.__({ phrase: "update_available_message_two", locale: "general" }),
        buttons: [i18n.__({ phrase: "update_available_btn_yes", locale: "general" }), i18n.__({ phrase: "update_available_btn_no", locale: "general" })]
    }, function(response) {
        if (response == 0) {
            OpenUpdateWindow(mainWindow, ev.version, ev.releaseNotes);
        }
    });

});

function OpenUpdateWindow(win, version, releasenote) {

    let updatewin = new BrowserWindow({
        width: 350,
        height: 450,
        parent: win,
        modal: true,
        show: false,
        resizable: false,
        minimizable: false,
        maximizable: false
    });

    updatewin.loadURL(`file://${__dirname}/html/update.html`);
    updatewin.setMenu(null);

    updatewin.once('ready-to-show', () => {
        updatewin.show();

        autoUpdater.downloadUpdate();
    });

    if (settings.get('dev')) {
        updatewin.webContents.openDevTools();
    }

    updatewin.webContents.on('did-finish-load', () => {

        updatewin.webContents.send('updateInfo', { "version": app.getVersion(), "new": version, "note": releasenote });

        updatewin.webContents.send('updateProgress', {});
        updatewin.webContents.send('updateProgressFinish', false);

    });

    autoUpdater.on('download-progress', (progressObj) => {
        updatewin.webContents.send('updateProgress', { "percent": progressObj.percent, "transferred": progressObj.transferred, "total": progressObj.total });
    });

    autoUpdater.on('update-downloaded', (ev, info) => {
        updatewin.webContents.send('updateProgressFinish', true);
    });

    autoUpdater.on('update-downloaded', function(info) {
        setTimeout(function() {
            autoUpdater.quitAndInstall();
        }, 1000);
    });

}

autoUpdater.on('error', (err) => {
    console.log(err);
});