const fs = require('fs');

module.exports = function(files, Directory) {

    if (files == 1) {
        this.file = "fr.json";
    } else if (files == 2) {
        this.file = "en.json";
    }
    this.error = false;
    this.location = Directory;
    this.loc = this.location + this.file;

    try {
        this.data = fs.readFileSync(this.loc);
    } catch (err) {
        this.error = true;
        if (err.code === 'ENOENT') {
            console.log('[ERROR] : Translation file not found ! (' + this.loc + ')');
        } else {
            console.log('[ERROR] : (' + err + ')');
        }
    }

    this.GetLine = function(Lines, replace = null) {

        if (this.error == false) {
            if (replace != null) {
                return JSON.parse(this.data)[Lines].replace('%s', replace);
            } else {
                return JSON.parse(this.data)[Lines];
            }
        }
    };

    return this;

};