const $ = require('jquery');
const ipcRenderer = require('electron').ipcRenderer;
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const settings = require('electron-settings');
const handlebars = require("handlebars");
const i18n = require("i18n");
const moment = require('moment');
const package = require(__dirname + '/../../package.json');
const os = require('os');
const fs = require('fs');

let db = low(new FileSync(os.homedir() + "/Documents/todolist-electron/project_list.json"));

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

document.title += " [v" + package.version + "]";

$("#home_menu > ul > li").click(function(e) {
    e.preventDefault();

    let page_name = $(this).data("page");
    let block = "#block_" + page_name;

    $(this).addClass("active");

    $("#home_menu > ul > li").not($(this)).removeClass("active");

    $("div .block_select").not($(block)).hide();
    $(block).show();

    return false;
});

$(".add_project").submit(function(e) {
    e.preventDefault();

    let title_project = $("#inputName").val();
    let desc_project = $("#inputDesc").summernote('code');

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
    let update_latest = "";
    if (value.date_lastup) {
        update_latest = i18n.__({ phrase: "content_myproject_list_date_last_update", locale: "home" }) + value.date_lastup;
    }
    $(".list_myprojects").append('<li class="list-group-item list-group-item-action flex-column align-items-start project_click" data-projectid="' + value.id + '"><div class="d-flex w-100 justify-content-between"><h5 class="mb-1">' + value.title + '</h5><small>' + i18n.__({ phrase: "content_myproject_list_date_create", locale: "home" }) + value.date_create + '</small></div><p class="mb-1">' + value.desc + '</p><small>' + update_latest + '<div class="float-right"><i class="fa fa-trash-o delete-project" aria-hidden="true"></i></div></small></li>');
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

$("#SettingsLang").change(function() {
    settings.set('lang', $(this).val());
    location.reload();
});

fs.readdir(__dirname + "/../locales/", (err, files) => {
    $("#SettingsLang").append('<option>' + i18n.__({ phrase: "settings_lang_choice" , locale: "home" }) + '</option>');
    files.forEach(file => {
        const selected = (settings.get('lang') === file) ? 'selected' : null;
        $("#SettingsLang").append('<option value="' + file + '" ' + selected + '>' + i18n.__({ phrase: "settings_lang_" + file, locale: "home" }) + '</option>');
    });
});

fs.readdir(__dirname + "/../assets/css/theme/", (err, files) => {
    $("#SettingsTheme").append('<option>' + i18n.__({ phrase: "settings_theme_choice", locale: "home" }) + '</option>');
    files.forEach(file => {
        const name = file.slice(0, -4);
        const selected = (settings.get('theme') === name) ? 'selected' : null;

        $("#SettingsTheme").append('<option value="' + name + '" ' + selected + '>' + i18n.__({ phrase: "settings_theme_" + name, locale: "home" }) + '</option>');
    });
});

$("#SettingsTheme").change(function() {
    settings.set('theme', $(this).val());
    location.reload();
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

$("#inputDesc").summernote();

let fetchStyle = function(url) {
    return new Promise((resolve, reject) => {
        let link = document.createElement('link');
        link.type = 'text/css';
        link.rel = 'stylesheet';
        link.onload = function() {
            resolve();
        };
        link.href = "../assets/css/theme/" + url + ".css";

        let headScript = document.querySelector('script');
        headScript.parentNode.insertBefore(link, headScript);
    });
};

fetchStyle(settings.get("theme"));