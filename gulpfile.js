const gulp = require('gulp');
const gulp_sass = require('gulp-sass');
const gulp_autoprefixer = require("gulp-autoprefixer");
const gulp_plumber = require("gulp-plumber");
const gulp_sourcemaps = require('gulp-sourcemaps');
const gulp_imagemin = require('gulp-imagemin');
const gulp_csslint = require('gulp-csslint');
const gulp_minify = require('gulp-minifier');

const scssBaseFiles = 'ressources/scss/**/*.scss';
const imageFiles = 'ressources/images/**/';
const jsFiles = 'ressources/js/**/*.js';
const fontsBaseFiles = 'ressources/fonts/**/';

const cssBaseDest = 'app/assets/css/';
const imageDest = 'app/assets/images/';
const jsDest = 'app/assets/js/';
const fontsDestFiles = "app/assets/fonts/";

gulp.task('css', function() {
    return gulp.src(scssBaseFiles)
        .pipe(gulp_plumber())
        .pipe(gulp_sourcemaps.init())
        .pipe(gulp_sass({ outputStyle: 'expanded' }).on('error', gulp_sass.logError))
        .pipe(gulp_autoprefixer())
        .pipe(gulp_csslint())
        .pipe(gulp_sourcemaps.write('./maps'))
        .pipe(gulp.dest(cssBaseDest))
});

gulp.task('minify', function() {
    gulp.src(cssBaseDest).pipe(gulp_minify({
        minify: true,
        collapseWhitespace: true,
        conservativeCollapse: true,
        minifyJS: true,
        minifyCSS: true,
        getKeptComment: function (content, filePath) {
            var m = content.match(/\/\*![\s\S]*?\*\//img);
            return m && m.join('\n') + '\n' || '';
        }
      })).pipe(gulp.dest(cssBaseDest));

    gulp.src(jsFiles).pipe(gulp_minify({
        minify: true,
        collapseWhitespace: true,
        conservativeCollapse: true,
        minifyJS: true,
        minifyCSS: true,
        getKeptComment: function (content, filePath) {
            var m = content.match(/\/\*![\s\S]*?\*\//img);
            return m && m.join('\n') + '\n' || '';
        }
      })).pipe(gulp.dest(jsDest));
});

gulp.task('image', function() {
    return gulp.src(imageFiles + '*.{png,jpg,jpeg,gif,svg}')
        .pipe(gulp_imagemin())
        .pipe(gulp.dest(imageDest));
});

gulp.task('fonts', function() {
    return gulp.src(fontsBaseFiles + '*.{eot,svg,ttf,woff,woff2,otf}')
        .pipe(gulp.dest(fontsDestFiles));
});

gulp.task('watch', function() {
    gulp.watch(scssBaseFiles, ['css']);
    gulp.watch(imageFiles + '*.{png,jpg,jpeg,gif,svg}', ['image']);
    gulp.watch(jsFiles, function() {
    });
    gulp.watch(fontsBaseFiles, function() {
    });
});

gulp.task('build', gulp.series('css', 'image', 'fonts'), 'minify');
/*gulp.task('default', ['css', 'watch']);
gulp.task('build', gulp.series('css', 'image', 'fonts'));
gulp.task('compile', gulp.series('css', 'image', 'fonts'))*/