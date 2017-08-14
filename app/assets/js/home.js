const $ = require('jquery');
const ipcRenderer = require('electron').ipcRenderer;
const low = require('lowdb');
const db = low(process.env.USERPROFILE + "/Documents/todolist-electron/project_list.json");
const settings = require('electron-settings');

db.defaults({ projects: [], projects_info: [] }).write();

document.title += " [v" + process.env.npm_package_version + "]";

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

        settings.set('lang', resu);

    }

});

console.log(settings.get('lang'))