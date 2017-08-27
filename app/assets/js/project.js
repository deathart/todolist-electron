const ipcRenderer = require('electron').ipcRenderer;
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const db = low(new FileSync(process.env.USERPROFILE + "/Documents/todolist-electron/project_list.json"));
const settings = require('electron-settings');
const translatejson = require('../lib/translate');
const Translate = new translatejson("home", __dirname + '/../locales/' + settings.get("lang") + "/");
const handlebars = require("handlebars");
const i18n = require("i18n");
const moment = require('moment');

let project_id = ipcRenderer.sendSync('getproject');
let project_info = db.get('projects').filter({ id: project_id }).value()[0];

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

$("#BtnHome").click(function(e) {
    e.preventDefault();
    ipcRenderer.send('change-page', { "name": 'home' });
});

$(".edit-project").click(function(e) {
    e.preventDefault();

    $("#inputName").val(project_info.title);
    $("#inputDesc").val(project_info.desc);

    $('#ModalEditProject').modal('show');

    return false;
});

$(".add_taskopenmodal").click(function(e) {
    e.preventDefault();

    $('#ModalAddTask').modal('show');

    return false;
});

$(".close-modal").click(function() {
    var modal_name = $(this).parents(".modal").attr('id');
    $('#' + modal_name).modal('hide');
});


$(".save-modal").click(function(e) {
    e.preventDefault();

    let title_project = $("#inputName").val(),
        desc_project = $("#inputDesc").val();

    if (title_project) {
        db.get('projects').find({ title: project_info.title }).assign({ title: title_project, desc: desc_project }).write();
    }
    return false;

});

$('.addTask-modal').click(function(ev) {
    ev.preventDefault();

    let task_title = $("#inputTitre").val();
    let task_type = $("#inputType").val();
    let task_date_finish = $("#inputDateFinish").val();
    let task_dest = $("#inputDest").val();
    let task_desc = $("#inputDescr").val();
    let task_date_create = moment().format("DD-MM-YYYY à HH:mm");

    let futur_id = 0;

    if (db.get('projects_info').size().value() > 0) {
        let last_task = db.get('projects_info').takeRight(1).value();
        futur_id = last_task[0].id + 1;
    } else {
        futur_id = 1;
    }

    if (task_title && task_type) {
        db.get('projects_info').push({ id: futur_id, projectId: project_id, title: task_title, date_create: task_date_create, type: task_type, dest: task_dest, desc: task_desc, date_finish: task_date_finish, progress: 0, close: false }).write();
        db.get('projects').find({ id: project_id }).assign({ date_lastup: task_date_create }).write();

        $(".list_task").append('<tr data-toggle="collapse" data-target=".collapse_info_' + futur_id + '" class="table-light" data-taskId="' + futur_id + '"><th scope="row">' + futur_id + '</th><td>' + task_title + '</td><td>' + task_type + '</td><td><div class="progress"><div class="progress-bar" role="progressbar" style="width: 0%;" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100">0%</div></div></td><td style="text-align: center;"><i class="fa fa-pencil-square-o edit-task" aria-hidden="true"></i><i class="fa fa-trash delete-task" aria-hidden="true"></i><i class="fa fa-check-square-o close-task" aria-hidden="true"></i></td></tr><tr><td colspan="4" class="hiddenRow"><div class="collapse collapse_info_' + futur_id + '"><div class="info_task_col">' + task_desc + '</div></div></td></tr>');

        $("#inputTitre").val("");
        $("#inputType").val("");
        $("#inputDateFinish").val("");
        $("#inputDest").val("");
        $("#inputDescr").val("");

        $('#ModalAddTask').modal('hide');

    }

    return false;

});

$.each(db.get('projects_info').filter({ projectId: project_id }).value(), function(key, value) {
    let class_close = "";
    let task_prog = "";
    if (value.close) {
        class_close = "table-success";
        task_prog = 100;
    } else {
        class_close = "table-light";
        task_prog = value.progress;
    }
    $(".list_task").append('<tr data-toggle="collapse" data-target=".collapse_info_' + value.id + '" class="' + class_close + '" data-taskId="' + value.id + '"><th scope="row">' + value.id + '</th><td>' + value.title + '</td><td>' + value.type + '</td><td><div class="progress"><div class="progress-bar" role="progressbar" style="width: ' + task_prog + '%;" aria-valuenow="' + task_prog + '" aria-valuemin="0" aria-valuemax="100">' + task_prog + '%</div></div></td><td style="text-align: center;"><i class="fa fa-pencil-square-o edit-task" aria-hidden="true"></i><i class="fa fa-trash delete-task" aria-hidden="true"></i><i class="fa fa-check-square-o close-task" aria-hidden="true"></i></td></tr><tr><td colspan="5" class="hiddenRow"><div class="collapse collapse_info_' + value.id + '"><div class="info_task_col">' + value.desc + '</div></div></td></tr>');
});

$('.collapse').on('show.bs.collapse', function() {
    $('.collapse.show').collapse('hide');
});

$(".close-task").click(function() {
    let task_id = $(this).parents("tr").data("taskid");
    if (!db.get('projects_info').filter({ id: task_id }).value()[0].close) {
        db.get('projects_info').find({ id: task_id }).assign({ close: true }).write();
        $(this).parents("tr").removeClass("table-light").addClass("table-success");
    } else {
        db.get('projects_info').find({ id: task_id }).assign({ close: false }).write();
        $(this).parents("tr").removeClass("table-success").addClass("table-light");
    }
});

$(".edit-task").click(function() {

});

$(".delete-task").click(function() {

});