var gulp =require('gulp'),
    fs = require('fs'),
    path = require('path'),
    replace = require('gulp-replace'),
    foreach = require('gulp-foreach'),
    replaceHtml = "(?:href|src|data-main)=(?:(\"|'|\\s*)([^\\s]+)\\1)",
    replaceCss = "url\\((\"|'?)(.+?)(\\1)\\)",
    common = require('./common'),
    utils = require('../utils'),
    manifestPath = path.join(__dirname, '../.tmp/manifest.json'),
    manifestCdnPath = path.join(__dirname, '../.tmp/manifest-cdn.json'),
    manifestAssetsPath = path.join(__dirname, '../.tmp/manifest-assets.json'),
    manifestAssetsCdnPath = path.join(__dirname, '../.tmp/manifest-assets-cdn.json'),
    config = require('../config/gulpconfig.json');

function replaceFunc(callback, src, manifest, isRewrite) {

    return gulp.src(src)
        .pipe(foreach(function (stream) {
            return stream.pipe(replace(new RegExp(replaceHtml, 'gm'),
                    function (match, seperator, url) {
                    var key;

                    for(key in manifest) {
                        if (match.indexOf(key) > -1) {
                            return match.replace(url,
                                isRewrite ?
                                path.join(config.cdn.server, manifest[key]) :
                                manifest[key]);
                        }
                    }
                    return match;

                }))
                .pipe(replace(new RegExp(replaceCss, 'gm'),
                    function (match, seperator, url) {

                    for(key in manifest) {
                        if (match.indexOf(key) > -1) {
                            // replace cdn address
                            if (!isRewrite) {
                                return match.replace(url, manifest[key]);
                            }
                            // replace file to local or rewrited server
                            return match.replace(config.cdn.server ? url : key,
                                path.join(config.cdn.server, manifest[key]));
                        }
                    }
                    return match;

                }));
        }))
        .pipe(gulp.dest(config.paths.dist))
        .pipe(common.throughEach(null, function (cb) {
            cb();
            callback();
        }));

}

module.exports.replaceAssets = function (callback) {

    var src = [common.allFile(config.paths.dist, 'html'),
                common.allFile(config.paths.dist, 'js'),
                common.allFile(config.paths.dist, 'css')];

    utils.Common.isExists(manifestAssetsCdnPath).then(function () {
        return replaceFunc(callback, src, require(manifestAssetsCdnPath));
    }, function () {
        utils.Common.isExists(manifestAssetsPath).then(function () {
            return replaceFunc(callback, src, require(manifestAssetsPath), true);
        }, function () {
            console.log('skip: replace assets');
            callback();
        });
    });

}

module.exports.replace = function (callback) {

    var src = [common.allFile(config.paths.dist, 'html'),
        common.allFile(config.paths.dist, 'css')];

    utils.Common.isExists(manifestCdnPath).then(function () {
        return replaceFunc(callback, src, require(manifestCdnPath));
    }, function () {
        utils.Common.isExists(manifestPath).then(function () {
            return replaceFunc(callback, src, require(manifestPath), true);
        }, function () {
            console.log('skip: replace');
            callback();
        });
    });

};
