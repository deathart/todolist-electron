const $ = require('jquery');
const ipcRenderer = require('electron').ipcRenderer;
const low = require('lowdb');
const db = low(process.env.USERPROFILE + "/Documents/todolist-electron/project_list.json");
const settings = require('electron-settings');

db.defaults({ projects: [] }).write();

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