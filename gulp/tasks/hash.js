/**
 * - hash assets used in html, css, js
 * - hash js or others static resources
 *
 * @author wungqiang, wungqiang@gmail.com
 * @motto 每个工程师都有保持代码优雅的义务
 * @date 2016
 */

var gulp = require('gulp'),
    rev = require('gulp-rev'),
    order = require('gulp-order'),
    foreach = require('gulp-foreach'),
    header = require('gulp-header'),
    fs = require('fs'),
    path = require('path'),
    common = require('./common'),
    utils = require('../utils'),
    config = require('../config/gulpconfig.json'),
    manifestPath = path.join(__dirname, '../../', config.paths.manifestFile),
    manifestAssetsPath = path.join(__dirname, '../../', config.paths.manifestAssetsFile);

function recordStatic(src, base, staticFile, configPath, callback) {
    gulp.src(src, {base: base})
    .pipe(common.throughEach(function (file, cb) {
        staticFile[file.relative] = file.relative;
        cb();
    }, function (cb) {
        fs.writeFileSync(configPath, JSON.stringify(staticFile, null, '  '));
        cb();
        callback();
    }));
}


module.exports.hashAssets = function (callback) {

    var src = common.allFile(config.paths.distImages, config.task.ext.image),
        base = config.paths.dist, staticFile = {};

    if (!config.task.hash) {
        utils.Common.isExists(manifestAssetsPath).then(function () {
            staticFile = require(manifestAssetsPath);
            recordStatic(src, base, staticFile, manifestAssetsPath, callback);
        }, function () {
            utils.Common.createFile(manifestAssetsPath, '{}').then(function () {
                recordStatic(src, base, staticFile, manifestAssetsPath, callback);
            }, function () {
                console.log('create file failed: ', manifestAssetsPath);
                callback();
            });
        })
        return console.log('disabled: hash assets');
    }

    gulp.src(src, {base: base})
        .pipe(rev())
        .pipe(gulp.dest(config.paths.dist))
        .pipe(common.throughEach(function (file, cb) {
            if (!file.revOrigPath) {
                return cb();
            }
            fs.unlink(file.revOrigPath, function (err) {
                if (err) {
                    console.log(err);
                }
                cb(null, file);
            });
        }))
        .pipe(rev.manifest(config.paths.manifestAssetsFile, {
                merge: true
        }))
        .pipe(gulp.dest('.'))
        .pipe(common.throughEach(null, function (cb) {
            cb();
            callback();
        }));

};

module.exports.hash = function (callback) {

    var moduleMap = {};

    var src = [common.allFile(config.paths.distStyles, 'css'),
                common.allFile(config.paths.distScripts, 'js')],
        base = config.paths.dist, staticFile = {}, corePath;

    if (!config.task.hash) {
        utils.Common.isExists(manifestPath).then(function () {
            staticFile = require(manifestPath);
            recordStatic(src, base, staticFile, manifestPath, callback);
        }, function () {
            utils.Common.createFile(manifestPath, '{}').then(function () {
                recordStatic(src, base, staticFile, manifestPath, callback);
            }, function () {
                console.log('create file failed: ', staticConfigFilePath);
                callback();
            });
        })
        return console.log('disabled: hash');
    }

    corePath = path.join(config.paths.distScripts, config.paths.coreJsName);

    gulp.src(src.concat('!' + corePath), {base: base})
        .pipe(rev())
        .pipe(gulp.dest(config.paths.dist))
        .pipe(common.throughEach(function (file, cb) {
            if (!file.revOrigPath) {
                return cb();
            }

            // record module map
            moduleMap[path.basename(file.revOrigPath, '.js')] =
                path.basename(file.relative, '.js');

            // remove original file
            fs.unlink(file.revOrigPath, function (err) {
                if (err) {
                    console.log(err);
                }
                cb(null, file);
            });
        }))
        .pipe(rev.manifest(config.paths.manifestFile, {
                merge: true
        }))
        .pipe(gulp.dest('.'))
        .pipe(common.throughEach(null, function (cb) {
            // hash corejs last
            gulp.src(corePath, {base: base})
            .pipe(header(';(function(){window.MODULE_MAP=' + JSON.stringify(moduleMap) + ';})();'))
            .pipe(rev())
            .pipe(gulp.dest(config.paths.dist))
            .pipe(rev.manifest(config.paths.manifestFile, {
                    merge: true
            }))
            .pipe(gulp.dest('.'))
            .pipe(common.throughEach(null, function (headerCb) {
                // remove original corejs
                fs.unlink(corePath, function (err) {
                    if (err) {
                        console.log(err);
                    }
                    headerCb();
                    cb();
                    callback();
                });
            }));
        }));

};
