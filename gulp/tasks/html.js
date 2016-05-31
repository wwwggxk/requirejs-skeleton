var gulp = require('gulp'),
    path = require('path'),
    inject = require('gulp-inject'),
    gulpif = require('gulp-if'),
    replace = require('gulp-replace'),
    htmlmin = require('gulp-htmlmin'),
    common = require('./common'),
    config = require('../config/gulpconfig.json');

module.exports.other = function () {

    gulp.src(common.childFile(config.paths.base, config.ext.meta))
        .pipe(gulp.dest(config.paths.dist));

};

module.exports.html = function () {

    var mergedStyle = path.join(config.paths.distStyles,
            config.paths.mainCssName);

    return gulp.src(config.paths.srcIndex)
        .pipe(inject(gulp.src(mergedStyle), {
            relative: true,
            ignorePath: config.paths.dist
        }))
        .pipe(gulpif(config.ga.enabled,
            replace(config.ga.key,
                config.ga.script.replace(config.ga.placeholder,
                    config.ga.trackingId))))
        .pipe(htmlmin({
            collapseWhitespace: true,
            removeComments: true
        }))
        .pipe(gulp.dest(config.paths.dist));

};
