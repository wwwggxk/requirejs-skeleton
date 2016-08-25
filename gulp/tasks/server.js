/**
 * - host local static server
 *
 * @author wungqiang, wungqiang@gmail.com
 * @motto 每个工程师都有保持代码优雅的义务
 * @date 2016
 */

var path = require('path'),
    NoServer = require('no-server'),
    config = require('../config/gulpconfig.json'),
    watchTask = require('./watch'),
    relativePath = '../../';

module.exports.local = function () {

    NoServer
        .create(path.join(relativePath, config.debug.root), {
            browse: true,
            port: config.debug.port
        })
        .start().then(watchTask.watch);

};
