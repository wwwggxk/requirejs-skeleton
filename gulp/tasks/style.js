var gulp = require('gulp'),
    path = require('path'),
    concat = require('gulp-concat'),
    sass = require('gulp-sass'),
    foreach = require('gulp-foreach'),
    cleanCss = require('gulp-clean-css'),
    cssAutoprefix = require('gulp-autoprefixer'),
    merge = require('merge-stream'),
    NoServer = require('no-server'),
    common = require('./common'),
    config = require('../config/gulpconfig.json');

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

module.exports.css =  function () {

    var mainStylePath = common.extFile(path.join(config.paths.srcStyles,
            path.basename(config.paths.mainCssName, '.css')),
            config.task.ext.style),
        coreStylePath = path.join(config.paths.srcStyles,
            config.paths.coreCssName),

        cssStream = gulp.src(mainStylePath, {base: '.'})
        .pipe(foreach(css(true))),

        coreStream = gulp.src(coreStylePath)
            .pipe(cleanCss({
                keepSpecialComments: 0
            }));

    gulp.src([common.allFile(config.paths.srcStyles, '.css'),
            '!' + mainStylePath, '!' + coreStylePath])
        .pipe(foreach(css(true)))
        .pipe(gulp.dest(config.paths.distStyles));

    return merge(coreStream, cssStream)
        .pipe(concat(config.paths.mainCssName))
        .pipe(gulp.dest(config.paths.distStyles));

};
