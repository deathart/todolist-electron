const { ipcMain, electron, app, BrowserWindow } = require('electron');
const windowStateKeeper = require('electron-window-state');
const fs = require('fs');
const settings = require('electron-settings');

let mainWindow;

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
    settings.set('lang', 1);
}

function createWindow() {

    let mainWindowState = windowStateKeeper({
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

    mainWindowState.manage(mainWindow);

    mainWindow.loadURL(`file://${__dirname}/html/home.html`);

    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
    });

    mainWindow.webContents.openDevTools();

    mainWindow.on('closed', () => {
        mainWindow = null;
    });

    //require('./menu');
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
    if (arg.type == "project") {
        let projectID = arg.project_id;
        mainWindow.webContents.on('did-finish-load', () => {});
        ipcMain.on('getproject', (event, arg) => {
            event.returnValue = projectID;
        });

    }
});