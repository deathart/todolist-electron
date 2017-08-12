const { Menu } = require('electron');
const electron = require('electron');
const app = electron.app;

const template = [{
    label: 'Fichier',
    submenu: [{
        label: 'Quitter',
        click() {
            app.quit();
        }
    }]
}, {
    label: '?',
    submenu: [{
            label: 'Mise à jour',
            click() {

            }
        },
        {
            label: 'Information',
            click() {

            }
        }
    ]
}];

const menu = Menu.buildFromTemplate(template);
Menu.setApplicationMenu(menu);