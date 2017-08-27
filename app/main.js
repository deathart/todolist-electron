const { ipcMain, electron, app, BrowserWindow, Menu } = require('electron');
const windowStateKeeper = require('electron-window-state');
const fs = require('fs');
const settings = require('electron-settings');
const i18n = require("i18n");

let mainWindow;
let mainWindowState;

if (!fs.existsSync(process.env.USERPROFILE + "/Documents/todolist-electron")) {
    fs.mkdirSync(process.env.USERPROFILE + "/Documents/todolist-electron");
    fs.writeFile(process.env.USERPROFILE + "/Documents/todolist-electron/project_list.json", "", (err) => {
        if (err) {
            throw err;
        }
    });
} else {
    if (!fs.existsSync(process.env.USERPROFILE + "/Documents/todolist-electron/project_list.json")) {
        fs.writeFile(process.env.USERPROFILE + "/Documents/todolist-electron/project_list.json", "", (err) => {
            if (err) {
                throw err;
            }
        });
    }
}

function createWindow() {

    mainWindowState = windowStateKeeper({
        defaultWidth: 1300,
        defaultHeight: 800
    });

    mainWindow = new BrowserWindow({
        x: mainWindowState.x,
        y: mainWindowState.y,
        width: mainWindowState.width,
        height: mainWindowState.height,
        minWidth: 1300,
        minHeight: 800,
        backgroundColor: '#312450',
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

                }
            },
            {
                label: i18n.__({ phrase: "menu_Other_info", locale: "general" }),
                accelerator: 'CmdOrCtrl+I',
                click(menuItem, currentWindow) {
                    OpenAboutWindow(mainWindow);
                }
            }
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

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

app.on('ready', function() {
    if (!settings.has('lang')) {
        settings.set('lang', "fr");
    }

    if (!settings.has('dev')) {
        settings.set('dev', false);
    }

    i18n.configure({
        directory: __dirname + '/locales/fr/'
    });
    createWindow();

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
    mainWindow.webContents.loadURL(`file://${__dirname}/html/` + page_name + `.html`);
    if (arg.name == "project") {
        let projectID = arg.project_id;
        ipcMain.on('getproject', (event, arg) => {
            event.returnValue = projectID;
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
        parent: mainWindow,
        modal: true,
        show: false,
        resizable: false,
        minimizable: false,
        maximizable: false
    });

    aboutwin.loadURL(`file://${__dirname}/html/about.html`);
    aboutwin.setMenu(null);
    aboutwin.webContents.closeDevTools();
    aboutwin.once('ready-to-show', () => {
        aboutwin.show();
    });

    if (settings.get('dev')) {
        aboutwin.webContents.openDevTools();
    }

}