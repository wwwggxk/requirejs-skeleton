var gulp = require('gulp'),
    rev = require('gulp-rev'),
    fs = require('fs'),
    path = require('path'),
    common = require('./common'),
    utils = require('../utils'),
    staticPath = path.join(__dirname, '../.tmp/static.json'),
    config = require('../config/gulpconfig.json');

function recordStatic(src, base, staticFile, callback) {
    gulp.src(src, {base: base})
    .pipe(common.throughEach(function (file, cb) {
        staticFile[file.relative] = file.relative;
        cb();
    }, function (cb) {
        fs.writeFileSync(config.paths.staticFile,
            JSON.stringify(staticFile, null, '  '));
        cb();
        callback();
    }));
}


module.exports.hashAssets = function (callback) {

    var src = common.allFile(config.paths.distImages, config.ext.image),
        base = config.paths.dist, staticFile = {};

    if (!config.task.hash) {
        recordStatic(src, base, staticFile, callback);
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


    var src = [common.allFile(config.paths.distStyles, 'css'),
                common.allFile(config.paths.distScripts, 'js')],
        base = config.paths.dist, staticFile = {};

    if (!config.task.hash) {
        utils.Common.isExists(staticPath).then(function () {
            staticFile = require(staticPath);
            recordStatic(src, base, staticFile, callback);
        }, function () {
            utils.Common.createFile(staticPath, '{}').then(function () {
                recordStatic(src, base, staticFile, callback);
            }, function () {
                console.log('create file failed: ', staticConfigFilePath);
            });
        })
        return console.log('disabled: hash');
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
        .pipe(rev.manifest(config.paths.manifestFile, {
                merge: true
        }))
        .pipe(gulp.dest('.'))
        .pipe(common.throughEach(null, function (cb) {
            cb();
            callback();
        }));

};
