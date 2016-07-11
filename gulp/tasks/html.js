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
            config.paths.mainCssName),
        src = common.allFile(config.paths.srcTemplates, config.ext.html);

    return gulp.src(src, {base: config.paths.base})
        .pipe(inject(gulp.src(mergedStyle), {
            relative: true,
            ignorePath: config.paths.dist
        }))
        .pipe(gulpif(config.ga.enabled,
            replace(config.ga.key,
                config.ga.script.replace(config.ga.placeholder,
                    config.ga.trackingId))))
        .pipe(gulpif(config.task.minihtml, htmlmin({
            collapseWhitespace: true,
            removeComments: true
        })))
        .pipe(gulp.dest(config.paths.dist));

};
