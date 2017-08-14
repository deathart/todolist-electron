const $ = require('jquery');
const ipcRenderer = require('electron').ipcRenderer;
const low = require('lowdb');
const db = low(process.env.USERPROFILE + "/Documents/todolist-electron/project_list.json");
const settings = require('electron-settings');

let project_id = ipcRenderer.sendSync('getproject');
let project_name = db.get('projects').filter({ id: project_id }).value()[0].title;

document.title += " (" + project_name + ") [v" + process.env.npm_package_version + "]";