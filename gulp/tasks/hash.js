var gulp = require('gulp'),
    rev = require('gulp-rev'),
    fs = require('fs'),
    common = require('./common'),
    config = require('../config/gulpconfig.json');

module.exports.hashAssets = function () {

    var src = common.allFile(config.paths.distImages, config.ext.image),
        base = config.paths.dist;

    return gulp.src(src, {base: base})
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
        .pipe(gulp.dest('.'));

};

module.exports.hash = function () {

    var src = [common.allFile(config.paths.distStyles, 'css'),
                common.allFile(config.paths.distScripts, 'js')],
        base = config.paths.dist;

    return gulp.src(src, {base: base})
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
        .pipe(gulp.dest('.'));

};
