var path = require('path'),
    NoServer = require('no-server'),
    config = require('../config/gulpconfig.json'),
    watchTask = require('./watch'),
    relativePath = '../../';

module.exports.local = function () {

    NoServer
        .create(path.join(relativePath, config.server.root), {
            browse: true,
            port: config.server.port
        })
        .start().then(watchTask.watch);

};
