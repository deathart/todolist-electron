const gulp = require('gulp');
const plugins = require('gulp-load-plugins')();

const sassFiles = 'app/assets/scss/**/*.scss';
const cssDest = 'app/assets/css/';

gulp.task('scss', function() {
    return gulp.src(sassFiles)
        .pipe(plugins.sass())
        .pipe(plugins.csscomb())
        .pipe(plugins.autoprefixer())
        .pipe(gulp.dest(cssDest));
});

gulp.task('watch', function() {
    gulp.watch(sassFiles, ['scss']);
});

gulp.task('default', ['scss']);