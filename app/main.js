const { ipcMain, electron, app, BrowserWindow } = require('electron');

let mainWindow;

function createWindow() {

    mainWindow = new BrowserWindow({ width: 1800, height: 1200, minWidth: 1180, minHeight: 600, backgroundColor: '#312450', show: false });

    mainWindow.loadURL(`file://${__dirname}/html/index.html`);

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
    if (arg.project_id) { //set project if for project html page
        let projectID = arg.project_id;
        mainWindow.webContents.on('did-finish-load', () => {
            mainWindow.webContents.send('project_id', projectID);
        });
    }
});