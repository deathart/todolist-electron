const $ = require('jquery');
const ipcRenderer = require('electron').ipcRenderer;

$("#test").click(function(e) {
    ipcRenderer.send('change-page', { "name": 'project', "project_id": 5 });
});