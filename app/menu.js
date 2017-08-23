const { Menu, electron, app } = require('electron');
const settings = require('electron-settings');
const i18n = require("i18n");

i18n.configure({
    directory: __dirname + '/locales/' + settings.get('lang') + "/"
});

let template;
let menuBuild;

template = [{
    label: i18n.__({ phrase: "menu_file", locale: "general" }),
    submenu: [{
        label: i18n.__({ phrase: "menu_file_exit", locale: "general" }),
        accelerator: 'Alt+F4',
        click() {
            app.quit();
        }
    }]
}, {
    label: '?',
    submenu: [{
            label: i18n.__({ phrase: "menu_Other_update", locale: "general" }),
            accelerator: 'CmdOrCtrl+U',
            click() {

            }
        },
        {
            label: i18n.__({ phrase: "menu_Other_info", locale: "general" }),
            accelerator: 'CmdOrCtrl+I',
            click() {

            }
        }
    ]
}];

menuBuild = Menu.buildFromTemplate(template);
Menu.setApplicationMenu(menuBuild);