const $ = require('jquery');
const ipcRenderer = require('electron').ipcRenderer;
const low = require('lowdb');
const db = low(process.env.USERPROFILE + "/Documents/todolist-electron/project_list.json");
const settings = require('electron-settings');
const translatejson = require('../lib/translate');
const Translate = new translatejson("home", __dirname + '/../locales/' + settings.get("lang") + "/");
const handlebars = require("handlebars");
const i18n = require("i18n");

db.defaults({ projects: [], projects_info: [] }).write();

document.title += Translate.GetLine("title") + " [v" + process.env.npm_package_version + "]";

i18n.configure({
    locales: ['en', 'fr'],
    directory: __dirname + '/../locales/'
});

handlebars.registerHelper('i18n', function(str) {
    return i18n.__({ phrase: str, locale: settings.get('lang') + "/home" });
});

let template = handlebars.compile(document.documentElement.innerHTML);
document.documentElement.innerHTML = template();

$("#home_menu > ul > li").click(function() {

    let page_name = $(this).data("page");
    let block = ".block_" + page_name;

    $(this).addClass("active");

    $("#home_menu > ul > li").not($(this)).removeClass("active");

    $("div #block_select").not($(block)).hide();
    $(block).show();

    return false;

});

$(".add_project").submit(function(e) {
    e.preventDefault();

    let title_project = $("#inputName").val();

    let futur_id = 0;

    if (db.get('projects').size().value() > 0) {
        let last_project = db.get('projects').takeRight(1).value();
        futur_id = last_project[0].id + 1;
    } else {
        futur_id = 1;
    }

    db.get('projects').push({ id: futur_id, title: title_project }).write();

    ipcRenderer.send('change-page', { "name": 'project', "type": 'project', "project_id": futur_id });

    return false;
});


$.each(db.get('projects').value(), function(key, value) {
    $(".list_myprojects").append('<li class="list-group-item project_click" data-projectid="' + value.id + '">' + value.title + '</li>');
});

$(".project_click").click(function() {
    let id_project = $(this).data("projectid");
    ipcRenderer.send('change-page', { "name": 'project', "type": 'project', "project_id": id_project });
});

$("#inlineFormCustomSelectPref").change(function() {

    let resu = $(this).val();

    if (parseInt(resu)) {
        if (resu == 1) {
            settings.set('lang', 'fr');
        } else if (resu == 2) {
            settings.set('lang', 'en');
        }
        location.reload();
    }

});