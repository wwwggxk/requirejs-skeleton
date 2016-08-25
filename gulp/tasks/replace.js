/**
 * - replace processed assets path in js, html, css files
 * - replace processed static files path in html, js files
 *
 * @author wungqiang, wungqiang@gmail.com
 * @motto 每个工程师都有保持代码优雅的义务
 * @date 2016
 */

var gulp =require('gulp'),
    fs = require('fs'),
    path = require('path'),
    replace = require('gulp-replace'),
    foreach = require('gulp-foreach'),
    replaceHtml = "(?:href|src|data-main)=(?:(\"|'|\\s*)([^\\s]+)\\1)",
    replaceCss = "url\\((\"|'?)(.+?)(\\1)\\)",
    common = require('./common'),
    utils = require('../utils'),
    config = require('../config/gulpconfig.json'),
    manifestPath = path.join(__dirname, '../.tmp/manifest.json'),
    manifestCdnPath = path.join(__dirname, '../.tmp/manifest-cdn.json'),
    manifestAssetsPath = path.join(__dirname, '../.tmp/manifest-assets.json'),
    manifestAssetsCdnPath = path.join(__dirname, '../.tmp/manifest-assets-cdn.json'),
    staticConfigFilePath = path.join(__dirname, '../../', config.paths.staticConfigFile);

function replaceFunc(callback, src, manifest, isRewrite) {

    utils.Common.isExists(staticConfigFilePath).then(function () {
        var staticConfig = require(staticConfigFilePath), key;
        for(key in manifest) {
            staticConfig[key] = manifest[key];
        }
        fs.writeFileSync(staticConfigFilePath,
            JSON.stringify(staticConfig, null, '  '));
        doReplace(callback, src, manifest, isRewrite);
    }, function () {
        utils.Common.createFile(staticConfigFilePath, '{}').then(function () {
            var staticConfig = require(staticConfigFilePath), key;
            for(key in manifest) {
                staticConfig[key] = manifest[key];
            }
            fs.writeFileSync(staticConfigFilePath,
                JSON.stringify(staticConfig, null, '  '));
            doReplace(callback, src, manifest, isRewrite);
        }, function () {
            console.log('create file failed: ', staticConfigFilePath);
            callback();
        });
    });
        }

function doReplace(callback, src, manifest, isRewrite) {

    gulp.src(src)
        .pipe(foreach(function (stream) {
             stream.pipe(replace(new RegExp(replaceHtml, 'gm'),
                    function (match, seperator, url) {
                    var key;

                    for(key in manifest) {
                        if (match.indexOf(key) > -1) {
                            var target = isRewrite ?
                                (config.task.rewrite.server ?
                                    utils.Common.joinPath(config.task.rewrite.server, manifest[key]) :
                                    manifest[key]) :
                                manifest[key];

                            console.log('replace ' + key + ' to ' + target);
                            return match.replace(url, target);
                        }
                    }
                    return match;

                }))
                .pipe(replace(new RegExp(replaceCss, 'gm'),
                    function (match, seperator, url) {

                    for(key in manifest) {
                        if (match.indexOf(key) > -1) {
                            var src = !isRewrite ?
                                    url :
                                    (config.task.rewrite.server ?  url : key),
                                target = !isRewrite ?
                                    manifest[key] :
                                    utils.Common.joinPath(config.task.rewrite.server, manifest[key]) ;

                            console.log('replace ' + key + ' to ' + target);
                            return match.replace(src, target);
                        }
                    }
                    return match;

                }))
                .pipe(gulp.dest(config.paths.dist))
                .pipe(common.throughEach(null, function (cb) {
                    cb();
                    callback();
                }));
        }));

}

module.exports.replaceAssets = function (callback) {

    var src = [common.allFile(config.paths.dist, 'html'),
                common.allFile(config.paths.dist, 'js'),
                common.allFile(config.paths.dist, 'css'),
                '!' + common.allFile(config.paths.distLibs)];

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
        common.allFile(config.paths.dist, 'js'),
        '!' + common.allFile(config.paths.distLibs)];

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
