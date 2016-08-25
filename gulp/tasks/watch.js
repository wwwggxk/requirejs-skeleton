/**
 * - watch files changing and hot reload resources
 *
 * @author wungqiang, wungqiang@gmail.com
 * @motto 每个工程师都有保持代码优雅的义务
 * @date 2016
 */

var gulp = require('gulp'),
    NoServer = require('no-server'),
    common = require('./common'),
    config = require('../config/gulpconfig.json'),
    styleTask = require('./style');

module.exports.watch = function () {

    gulp.watch(common.allFile(config.paths.base, config.task.ext.html),
        NoServer.reloadAll);
    gulp.watch(common.allFile(config.paths.srcScripts, 'js'),
        NoServer.reloadAll);
    gulp.watch(common.allFile(config.paths.srcImages, config.task.ext.image),
        NoServer.reloadAll);
    gulp.watch(common.allFile(config.paths.srcStyles, config.task.ext.style),
        styleTask.compileCss);

};
