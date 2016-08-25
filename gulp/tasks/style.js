/**
 * - generate core library css
 * - process css(compile sass, minify css, autoprefix)
 *
 * @author wungqiang, wungqiang@gmail.com
 * @motto 每个工程师都有保持代码优雅的义务
 * @date 2016
 */

var gulp = require('gulp'),
    path = require('path'),
    concat = require('gulp-concat'),
    sass = require('gulp-sass'),
    foreach = require('gulp-foreach'),
    cleanCss = require('gulp-clean-css'),
    cssAutoprefix = require('gulp-autoprefixer'),
    streamQueue = require('streamqueue'),
    NoServer = require('no-server'),
    common = require('./common'),
    config = require('../config/gulpconfig.json'),
    hasCoreCss = config.paths.srcCoreCss &&
        config.paths.srcCoreCss.length;

module.exports.coreCss = function () {

    return gulp.src(config.paths.srcCoreCss)
        .pipe(concat(config.paths.coreCssName))
        .pipe(gulp.dest(config.paths.srcStyles));

};

module.exports.compileCss = function () {

    gulp.src(common.allFile(config.paths.srcStyles, config.task.ext.style))
        .pipe(sass())
        .pipe(foreach(css(false)))
        .pipe(NoServer.streamReloadCss())
        .pipe(gulp.dest(config.paths.srcStyles));

};

function css(isCleanCss) {

    return function (stream) {
        var tmp = stream.pipe(sass())
            .pipe(cssAutoprefix({
                browsers: config.task.css.autoPrefixBrowsers,
                cascade: false
            }));

        if (!isCleanCss) {
            return tmp;
        }

        return tmp.pipe(cleanCss({
                aggressiveMerging: false,
                advanced: false,
                compatibility: 'ie7',
                keepBreaks: false
            }));
    };

}

function isCoreFile(filePath) {
    return path.basename(filePath) === config.paths.coreCssname;
}

module.exports.css =  function () {

    var coreStylePath = path.join(config.paths.srcStyles,
        config.paths.coreCssName),
        styles = [common.childFile(config.paths.srcStyles, 'css')];

    if (!hasCoreCss) {
        return gulp.src(styles)
            .pipe(foreach(css(true)))
            .pipe(gulp.dest(config.paths.distStyles));
    }

    if (!config.task.css.merge) {
        return gulp.src(styles)
            .pipe(foreach(function (stream, file) {
                return isCoreFile(file.relative) ? stream : css(true)(stream);
            }))
            .pipe(gulp.dest(config.paths.distStyles));
    }


    // merge core css to page css
    styles.push('!' + coreStylePath);
    return gulp.src(styles, {base: '.'})
        .pipe(foreach(function (stream, file) {
            return isCoreFile(file.relative) ? stream : css(true)(stream);
        }))
        .pipe(foreach(function (stream, file) {
            var coreStream = gulp.src(coreStylePath)
                .pipe(cleanCss({
                    keepSpecialComments: 0
                })),
                filename = path.basename(file.relative);

            return isCoreFile(file.relative) ?
                stream.pipe(gulp.dest(config.paths.distStyles)) :
                streamQueue({objectMode: true}, coreStream, stream)
                .pipe(concat(filename))
                .pipe(gulp.dest(config.paths.distStyles));
        }));

};
