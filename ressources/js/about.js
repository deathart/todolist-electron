const $ = require('jquery');
const ipcRenderer = require('electron').ipcRenderer;
const settings = require('electron-settings');
const handlebars = require("handlebars");
const i18n = require("i18n");
const package = require(__dirname + '/../../package.json');

i18n.configure({
    locale: "about",
    directory: __dirname + '/../locales/' + settings.get('lang') + "/"
});

handlebars.registerHelper('i18n', function(str) {
    return i18n.__({ phrase: str, locale: "about" });
});

let template = handlebars.compile(document.documentElement.innerHTML);
document.documentElement.innerHTML = template();

document.title += " [v" + package.version + "]";