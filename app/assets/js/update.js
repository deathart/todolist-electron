const $ = require('jquery');
const ipcRenderer = require('electron').ipcRenderer;
const settings = require('electron-settings');
const handlebars = require("handlebars");
const i18n = require("i18n");
const package = require(__dirname + '/../../package.json');

i18n.configure({
    locale: "update",
    directory: __dirname + '/../locales/' + settings.get('lang') + "/"
});

handlebars.registerHelper('i18n', function(str) {
    return i18n.__({ phrase: str, locale: "update" });
});

let template = handlebars.compile(document.documentElement.innerHTML);
document.documentElement.innerHTML = template();

ipcRenderer.on('updateInfo', (event, message) => {
    $("h5").append(message.new + " :");
    $(".changelog").html(message.note);
});

ipcRenderer.on('updateProgress', (event, message) => {
    let pourc = Math.round(message.percent) + "%";
    $(".progress-bar").css("width", pourc).html(pourc);
    $(".message").html(message.transferred + " Mb / " + message.total + " Mb");
});

ipcRenderer.on('updateProgressFinish', (event, message) => {
    if (message) {
        $(".message").html(i18n.__({ phrase: "update_finish", locale: "update" }));
    }
});