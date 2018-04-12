const gulp = require('gulp');
const sass = require('gulp-sass');
const autoprefixer = require("gulp-autoprefixer");
const plumber = require("gulp-plumber");

const sassFiles = 'app/assets/scss/**/*.scss';
const cssDest = 'app/assets/css/';

gulp.task('scss', function() {
    return gulp.src(sassFiles)
        .pipe(plumber())
        .pipe(sass({
                errLogToConsole: true,
                outputStyle: 'expanded'
            }
        ).on('error', sass.logError))
        .pipe(autoprefixer())
        .pipe(gulp.dest(cssDest));

});

gulp.task('watch', function() {
    return gulp.watch([sassFiles], ["scss"]).on('change', function(path) {
        console.log('File ' + path.path + ' was changed');
    });
});

gulp.task('default', gulp.series('scss'));