const $ = require('jquery');
const ipcRenderer = require('electron').ipcRenderer;

ipcRenderer.on('project_id', (event, message) => {
    console.log(message);
});