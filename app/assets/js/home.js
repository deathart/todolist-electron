const $ = require('jquery');
const ipcRenderer = require('electron').ipcRenderer;
const settings = require('electron-settings');

$("#home_menu > ul > li").click(function() {

    let page_name = $(this).data("page");
    let block = ".block_" + page_name;

    $(this).addClass("active");

    $("#home_menu > ul > li").not($(this)).removeClass("active");

    $("div #block_select").not($(block)).hide();
    $(block).show();

    return false;

});

$("#test").click(function(e) {
    ipcRenderer.send('change-page', { "name": 'project', "type": 'project', "project_id": 5 });
});