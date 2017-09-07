const ipcRenderer = require('electron').ipcRenderer;
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const settings = require('electron-settings');
const handlebars = require("handlebars");
const i18n = require("i18n");
const moment = require('moment');
const package = require(__dirname + '/../../package.json');

let adapter;

if (settings.get('crypt')) {
    adapter = new FileSync(process.env.USERPROFILE + "/Documents/todolist-electron/project_list.json", {
        format: {
            deserialize: function(str) {
                var decrypted = cryptr.decrypt(str);
                var obj = JSON.parse(decrypted);
                return obj;
            },
            serialize: function(obj) {
                var str = JSON.stringify(obj);
                var encrypted = cryptr.encrypt(str);
                return encrypted;
            }
        }
    });
} else {
    adapter = new FileSync(process.env.USERPROFILE + "/Documents/todolist-electron/project_list.json");
}

const db = low(adapter);

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

document.title += " (" + project_info.title + ") [v" + package.version + "]";

$("#config > p").prepend(project_info.title);

$("#config > p > small").html(project_info.desc);

$("#BtnHome").click(function(e) {
    e.preventDefault();
    ipcRenderer.send('change-page', { "name": 'home' });
});

$(".edit-project").click(function(e) {
    e.preventDefault();

    $("#inputName").val(project_info.title);
    $("#inputDescP").summernote('code', project_info.desc);

    $('#ModalEditProject').modal('show');

    return false;
});

$(".add_taskopenmodal").click(function(e) {
    e.preventDefault();
    $(".add_task").find("#inputDescr").summernote();
    $('#ModalAddTask').modal('show');

    return false;
});

$(".close-modal").click(function() {
    var modal_name = $(this).parents(".modal").attr('id');
    $('#' + modal_name).modal('hide');
});


$(".EditProject-modal").click(function(e) {
    e.preventDefault();

    $("#inputDescP").summernote();

    let title_project = $("#inputName").val(),
        desc_project = $("#inputDescP").summernote('code');

    if (title_project) {
        db.get('projects').find({ title: project_info.title }).assign({ title: title_project, desc: desc_project }).write();
        UpdateDateProject();
        $("#ModalEditProject").modal('hide');
    }
    return false;

});

$('.addTask-modal').click(function(ev) {
    ev.preventDefault();

    let task_input_title = $(".add_task").find("#inputTitre");
    let task_input_type = $(".add_task").find("#inputType");
    let task_input_date_finish = $(".add_task").find("#inputDateFinish");
    let task_input_dest = $(".add_task").find("#inputDest");
    let task_input_desc = $(".add_task").find("#inputDescr");

    let task_title = task_input_title.val();
    let task_type = task_input_type.val();
    let task_date_finish = task_input_date_finish.val();
    let task_dest = task_input_dest.val();
    let task_desc = task_input_desc.summernote('code');
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
        UpdateDateProject();

        $(".list_task").prepend('<tr data-toggle="collapse" data-target=".collapse_info_' + futur_id + '" class="table-light" data-taskId="' + futur_id + '"><th scope="row">' + futur_id + '</th><td>' + task_title + '</td><td>' + task_type + '</td><td><div class="progress"><div class="progress-bar" role="progressbar" style="width: 0%;" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100">0 %</div></div></td><td style="text-align: center;"><i class="fa fa-pencil-square-o edit-task" aria-hidden="true"></i><i class="fa fa-trash delete-task" aria-hidden="true"></i><i class="fa fa-check-square-o close-task" aria-hidden="true"></i></td></tr><tr><td colspan="4" class="hiddenRow"><div class="collapse collapse_info_' + futur_id + '"><div class="info_task_col">' + task_desc + '</div></div></td></tr>');

        task_input_title.val("");
        task_input_type.val("");
        task_input_date_finish.val("");
        task_input_dest.val("");
        task_input_desc.val("");

        $('#ModalAddTask').modal('hide');

    }

    return false;

});

$.each(db.get('projects_info').filter({ projectId: project_id }).sortBy('id').reverse().sortBy('close').reverse().value(), function(key, value) {

    let class_close = "";
    let task_prog = "";

    if (value.close) {
        class_close = "table-success";
        task_prog = 100;
    } else {
        class_close = "table-light";
        task_prog = value.progress;
    }

    $(".list_task").prepend('<tr data-toggle="collapse" data-target=".collapse_info_' + value.id + '" class="' + class_close + '" data-taskId="' + value.id + '"><th scope="row">' + value.id + '</th><td>' + value.title + '</td><td>' + value.type + '</td><td><div class="progress"><div class="progress-bar" role="progressbar" style="width: ' + task_prog + '%;" aria-valuenow="' + value.progress + '" aria-valuemin="0" aria-valuemax="100">' + task_prog + ' %</div></div></td><td style="text-align: center;"><i class="fa fa-pencil-square-o edit-task" aria-hidden="true"></i><i class="fa fa-trash delete-task" aria-hidden="true"></i><i class="fa fa-check-square-o close-task" aria-hidden="true"></i></td></tr><tr><td colspan="5" class="hiddenRow"><div class="collapse collapse_info_' + value.id + '"><div class="info_task_col">' + value.desc + '</div></div></td></tr>');

});

$('.collapse').on('show.bs.collapse', function() {
    $('.collapse.show').collapse('hide');
});

$(".close-task").click(function() {
    let task_id = $(this).parents("tr").data("taskid");

    if (!db.get('projects_info').filter({ id: task_id }).value()[0].close) {
        db.get('projects_info').find({ id: task_id }).assign({ close: true }).write();
        $(this).parents("tr").removeClass("table-light").addClass("table-success");
        $(this).parents("tr").find(".progress-bar").css("width", "100%").html("100%");
    } else {
        db.get('projects_info').find({ id: task_id }).assign({ close: false }).write();
        console.log($(this).parents("tr").find(".progress-bar").attr("aria-valuenow"));
        let progress_value_base = $(this).parents("tr").find(".progress-bar").attr("aria-valuenow");
        $(this).parents("tr").find(".progress-bar").css("width", progress_value_base + "%").html(progress_value_base + "%");
        $(this).parents("tr").removeClass("table-success").addClass("table-light");
    }

    UpdateDateProject();
});

$(".edit-task").click(function() {
    let task_id = $(this).parents("tr").data("taskid");
    let task = db.get('projects_info').filter({ id: task_id }).value()[0];

    $("#ModalUpdateTask").modal('show');

    let update_title = $(".update_task").find("#inputTitre");
    let update_type = $(".update_task").find("#inputType");
    let update_datefinish = $(".update_task").find("#inputDateFinish");
    let update_dest = $(".update_task").find("#inputDest");
    let update_desc = $(".update_task").find("#inputDescr");
    let update_progress = $(".update_task").find("#inputProgress");
    let update_close = false;

    update_desc.summernote();

    $('#ModalUpdateTask').on('shown.bs.modal', function(e) {

        update_title.val(task.title);
        update_type.val(task.type);
        update_datefinish.val(task.date_finish);
        update_dest.val(task.dest);
        update_desc.summernote('code', task.desc);
        update_progress.val(task.progress);

    });

    $(".UpdateTask-modal").click(function() {

        if (update_progress.val() == 100) {
            update_close = true;
        }

        db.get('projects_info').find({ id: task_id }).assign({ title: update_title.val(), type: update_type.val(), dest: update_dest.val(), desc: update_desc.summernote('code'), date_finish: update_datefinish.val(), progress: update_progress.val(), close: update_close }).write();
        UpdateDateProject();

        $('#ModalUpdateTask').modal('hide');

    });

    $('#ModalUpdateTask').on('hidden.bs.modal', function(e) {
        update_title.val("");
        update_type.val("");
        update_datefinish.val("");
        update_dest.val("");
        update_desc.val("");
        update_progress.val("");
    });

});

$(".delete-task").click(function() {
    let task_id = $(this).parents("tr").data("taskid");
    $(this).parents("tr").remove();
    $(".collapse_info_" + task_id).parents("tr").remove();
    db.get('projects_info').remove({ "id": task_id }).write();
});

function UpdateDateProject() {
    let date_now = moment().format("DD-MM-YYYY à HH:mm");
    db.get('projects').find({ id: project_id }).assign({ date_lastup: date_now }).write();
}

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