const $ = require('jquery');

var ipcRenderer = require('electron').ipcRenderer;

$("#test").click(function(e) {
    ipcRenderer.send('change-page', { "name": 'test' });
});