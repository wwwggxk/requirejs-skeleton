var gulp = require('gulp'),
    path = require('path'),
    concat = require('gulp-concat'),
    sass = require('gulp-sass'),
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

        gulp.src(common.allFile(config.paths.srcStyles, config.ext.style))
            .pipe(sass())
            .pipe(cssAutoprefix({
                browsers: config.css.autoPrefixBrowsers,
                cascade: false
            }))
            .pipe(NoServer.streamReloadCss())
            .pipe(gulp.dest(config.paths.srcStyles));

};

module.exports.css =  function () {

        var cssStream = gulp.src(common.allFile(config.paths.srcStyles,
                config.ext.style), {base: '.'})
            .pipe(sass())
            .pipe(cssAutoprefix({
                browsers: config.css.autoPrefixBrowsers,
                cascade: false
            }))
            .pipe(cleanCss({
                aggressiveMerging: false,
                advanced: false,
                compatibility: 'ie7',
                keepBreaks: false
            })),

            coreStream = gulp.src(path.join(config.paths.srcStyles,
                config.paths.coreCssName))
                .pipe(cleanCss({
                    keepSpecialComments: 0
                }));

        return merge(coreStream, cssStream)
            .pipe(concat(config.paths.mainCssName))
            .pipe(gulp.dest(config.paths.distStyles));

};
