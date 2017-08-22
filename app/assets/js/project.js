const ipcRenderer = require('electron').ipcRenderer;
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const db = low(new FileSync(process.env.USERPROFILE + "/Documents/todolist-electron/project_list.json"));
const settings = require('electron-settings');
const translatejson = require('../lib/translate');
const Translate = new translatejson("home", __dirname + '/../locales/' + settings.get("lang") + "/");
const handlebars = require("handlebars");
const i18n = require("i18n");

let project_id = ipcRenderer.sendSync('getproject');
let project_info = db.get('projects').filter({ id: project_id }).value()[0]

i18n.configure({
    directory: __dirname + '/../locales/' + settings.get('lang') + "/"
});

handlebars.registerHelper('i18n', function(str) {
    return i18n.__({ phrase: str, locale: "project" });
});

let template = handlebars.compile(document.documentElement.innerHTML);
document.documentElement.innerHTML = template();

document.title += " (" + project_info.title + ") [v" + process.env.npm_package_version + "]";

$("#config > p").prepend(project_info.title);

$("#config > p > small").html(project_info.desc);

$(".edit-project").click(function() {
    $("#inputName").val(project_info.title);
    $("#inputDesc").val(project_info.desc);
    $('#ModalEditProject').modal('show');
    $(".save-modal").click(function() {
        let title_project = $("#inputName").val();
        let desc_project = $("#inputDesc").val();
        if (title_project) {
            db.get('projects').find({ title: project_info.title }).assign({ title: title_project, desc: desc_project }).write();
        }
    });
    $(".close-modal").click(function() {
        $('#ModalEditProject').modal('hide');
    });
});