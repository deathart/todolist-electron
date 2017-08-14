const $ = require('jquery');
const ipcRenderer = require('electron').ipcRenderer;
const low = require('lowdb');
const db = low(process.env.USERPROFILE + "/Documents/todolist-electron/project_list.json");
const settings = require('electron-settings');
const translatejson = require('../lib/translate');
const Translate = new translatejson(settings.get("lang"), __dirname + '/../locales/');
const handlebars = require("handlebars");
const i18n = require("i18n");

let project_id = ipcRenderer.sendSync('getproject');
let project_name = db.get('projects').filter({ id: project_id }).value()[0].title;

i18n.configure({
    locales: ['en', 'fr'],
    directory: __dirname + '/../locales/'
});

handlebars.registerHelper('i18n', function(str) {
    return i18n.__({ phrase: str, locale: settings.get('lang') });
});

let template = handlebars.compile(document.documentElement.innerHTML);
document.documentElement.innerHTML = template();

document.title += Translate.GetLine("title_project") + " (" + project_name + ") [v" + process.env.npm_package_version + "]";