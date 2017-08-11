module.exports = {
    reporter: function(result, config, options) {
        require('jshint-stylish').reporter(result, config, options);
        require('jshint-stylish-summary').reporter(result, config, options);
    }
};