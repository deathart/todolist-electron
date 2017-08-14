const $ = require('jquery');
const ipcRenderer = require('electron').ipcRenderer;
const low = require('lowdb');
const db = low(process.env.USERPROFILE + "/Documents/todolist-electron/project_list.json");
const settings = require('electron-settings');
const translatejson = require('../lib/translate');
const Translate = new translatejson(settings.get("lang"), __dirname + '/../locales/');

let project_id = ipcRenderer.sendSync('getproject');
let project_name = db.get('projects').filter({ id: project_id }).value()[0].title;

document.title += Translate.GetLine("title_project") + " (" + project_name + ") [v" + process.env.npm_package_version + "]";