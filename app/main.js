const { ipcMain, electron, app, BrowserWindow } = require('electron');
const windowStateKeeper = require('electron-window-state');
const fs = require('fs');
const settings = require('electron-settings');

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

if (!settings.has('lang')) {
    settings.set('lang', "fr");
}

if (!settings.has('dev')) {
    settings.set('dev', false);
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

    mainWindow.loadURL(`file://${__dirname}/html/home.html`);

    mainWindow.once('ready-to-show', () => {
        mainWindowState.manage(mainWindow);
    });

    if (settings.get('dev')) {
        mainWindow.webContents.openDevTools();
    }

    mainWindow.on('closed', () => {
        mainWindow = null;
    });

    require('./menu');
}

app.on('ready', createWindow);

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