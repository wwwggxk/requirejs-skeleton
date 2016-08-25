/**
 * - html processing, inclucing minify or inject
 *
 * @author wungqiang, wungqiang@gmail.com
 * @motto 每个工程师都有保持代码优雅的义务
 * @date 2016
 */

var gulp = require('gulp'),
    path = require('path'),
    inject = require('gulp-inject'),
    gulpif = require('gulp-if'),
    replace = require('gulp-replace'),
    foreach = require('gulp-foreach'),
    htmlmin = require('gulp-htmlmin'),
    common = require('./common'),
    config = require('../config/gulpconfig.json'),
    hasCoreCss = config.paths.srcCoreCss &&
        config.paths.srcCoreCss.length;


module.exports.other = function () {

    gulp.src(common.childFile(config.paths.base, config.task.ext.meta))
        .pipe(gulp.dest(config.paths.dist));

};

module.exports.html = function () {

    var src = common.allFile(config.paths.srcTemplates, config.task.ext.html);

    return gulp.src(src, {base: config.paths.base})
        .pipe(foreach(function (stream, file) {
            var name = path.basename(file.relative, '.html');
            var stylePath = [path.join(config.paths.distStyles, name + '.css')];
            var relative = path.relative(config.paths.dist, config.paths.root);

            // inject core css
            if (!config.task.css.merge && hasCoreCss) {
                stylePath.unshift(path.join(config.paths.distStyles,
                    config.paths.coreCssName));
            }

            return stream
                .pipe(inject(gulp.src(stylePath,
                    {base: config.paths.distStyles}), {
                    relative: true,
                    ignorePath: path.join(relative, config.paths.dist)
                }))
        }))
        .pipe(gulpif(config.task.minihtml, htmlmin({
            collapseWhitespace: true,
            removeComments: true
        })))
        .pipe(gulp.dest(config.paths.dist));

};
