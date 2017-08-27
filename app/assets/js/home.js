const $ = require('jquery');
const ipcRenderer = require('electron').ipcRenderer;
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const db = low(new FileSync(process.env.USERPROFILE + "/Documents/todolist-electron/project_list.json"));
const settings = require('electron-settings');
const handlebars = require("handlebars");
const i18n = require("i18n");
const moment = require('moment');

db.defaults({ projects: [], projects_info: [] }).write();

i18n.configure({
    locale: "home",
    directory: __dirname + '/../locales/' + settings.get('lang') + "/"
});

handlebars.registerHelper('i18n', function(str) {
    return i18n.__({ phrase: str, locale: "home" });
});

let template = handlebars.compile(document.documentElement.innerHTML);
document.documentElement.innerHTML = template();

document.title += " [v" + process.env.npm_package_version + "]";

$("#home_menu > ul > li").click(function(e) {
    e.preventDefault();

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
    let desc_project = $("#inputDesc").val();

    let futur_id = 0;

    if (db.get('projects').size().value() > 0) {
        let last_project = db.get('projects').takeRight(1).value();
        futur_id = last_project[0].id + 1;
    } else {
        futur_id = 1;
    }

    let date_create = moment().format("DD-MM-YYYY à HH:mm");

    if (title_project) {
        db.get('projects').push({ id: futur_id, title: title_project, date_create: date_create, desc: desc_project, date_lastup: "" }).write();

        ipcRenderer.send('change-page', { "name": 'project', "project_id": futur_id });
    }
    return false;
});


$.each(db.get('projects').value(), function(key, value) {
    $(".list_myprojects").append('<li class="list-group-item list-group-item-action flex-column align-items-start project_click" data-projectid="' + value.id + '"><div class="d-flex w-100 justify-content-between"><h5 class="mb-1">' + value.title + '</h5><small>' + i18n.__({ phrase: "content_myproject_list_date_create", locale: "home" }) + value.date_create + '</small></div><p class="mb-1">' + value.desc + '</p><small>' + i18n.__({ phrase: "content_myproject_list_date_last_update", locale: "home" }) + value.date_lastup + '<div class="float-right"><i class="fa fa-trash-o delete-project" aria-hidden="true"></i></div></small></li>');
});

$(".project_click").click(function(e) {
    e.preventDefault();
    let id_project = $(this).data("projectid");
    ipcRenderer.send('change-page', { "name": 'project', "project_id": id_project });
    return false;
});

$(".delete-project").click(function(e) {

    e.preventDefault();

    var project_id = $(this).parents("li").data("projectid");

    db.get('projects').remove({ "id": project_id }).write();
    db.get('projects_info').remove({ "id": project_id }).write();

    $(this).parents("li").remove();

    return false;

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

if (settings.get('dev') == true) {
    $("#InputDevMode").prop('checked', true);
}

$("#InputDevMode").change(function() {
    if ($(this).is(":checked")) {
        settings.set('dev', true);
        ipcRenderer.send('change-dev', { "dev": true });
    } else {
        settings.set('dev', false);
        ipcRenderer.send('change-dev', { "dev": false });
    }
});