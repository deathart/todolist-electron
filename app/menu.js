const { Menu, electron, app } = require('electron');

let template;
let menuBuild;

template = [{
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

menuBuild = Menu.buildFromTemplate(template);
Menu.setApplicationMenu(menuBuild);