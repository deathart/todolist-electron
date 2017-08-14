const fs = require('fs');

module.exports = function(file, Directory) {

    this.error = false;
    this.location = Directory;
    this.loc = this.location + file + ".json";

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