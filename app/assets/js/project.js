const $ = require('jquery');
const ipcRenderer = require('electron').ipcRenderer;
const low = require('lowdb');
const db = low(process.env.USERPROFILE + "/Documents/todolist-electron/project_list.json");
const settings = require('electron-settings');
const translatejson = require('../lib/translate');
const Translate = new translatejson("home", __dirname + '/../locales/' + settings.get("lang") + "/");
const handlebars = require("handlebars");
const i18n = require("i18n");

let project_id = ipcRenderer.sendSync('getproject');
let project_name = db.get('projects').filter({ id: project_id }).value()[0].title;

i18n.configure({
    directory: __dirname + '/../locales/' + settings.get('lang') + "/"
});

handlebars.registerHelper('i18n', function(str) {
    return i18n.__({ phrase: str, locale: "project" });
});

let template = handlebars.compile(document.documentElement.innerHTML);
document.documentElement.innerHTML = template();

document.title += " (" + project_name + ") [v" + process.env.npm_package_version + "]";

$("#config > p").prepend(project_name);

$(".edit-project").click(function() {
    //Open modal for update project settings
    $('#ModalEditProject').modal('show');
});