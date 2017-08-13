const $ = require('jquery');
const ipcRenderer = require('electron').ipcRenderer;
const low = require('lowdb');
const db = low(process.env.USERPROFILE + "/Documents/todolist-electron/project_list.json");

document.title += " [v" + process.env.npm_package_version + "]";

let project_id = ipcRenderer.sendSync('getproject');