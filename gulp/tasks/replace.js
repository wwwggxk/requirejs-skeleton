var gulp =require('gulp'),
    replace = require('gulp-replace'),
    replaceHtml = "(?:href|src|data-main)=(?:(\"|'|\\s*)([^\\s]+)\\1)",
    replaceCss = "url\\((\"|'?)(.+?)(\\1)\\)",
    common = require('./common'),
    manifestCdnPath = '../config/manifest-cdn.json',
    manifestAssetsCdnPath = '../config/manifest-assets-cdn.json',
    config = require('../config/gulpconfig.json');

module.exports.replaceAssets = function () {

    var manifest = require(manifestAssetsCdnPath), key;

    return gulp.src([common.allFile(config.paths.dist, 'html'),
            common.allFile(config.paths.dist, 'js'),
            common.allFile(config.paths.dist, 'css')])
        .pipe(replace(new RegExp(replaceHtml, 'gm'),
            function (match, seperator, url) {

            for(key in manifest) {
                if (match.indexOf(key) > -1) {
                    return match.replace(url, manifest[key]);
                }
            }
            return match;

        }))
        .pipe(replace(new RegExp(replaceCss, 'gm'),
            function (match, seperator, url) {

            for(key in manifest) {
                if (match.indexOf(key) > -1) {
                    return match.replace(url, manifest[key]);
                }
            }
            return match;

        }))
        .pipe(gulp.dest(config.paths.dist));

};

module.exports.replace = function () {

    var manifest = require(manifestCdnPath), key;

    return gulp.src([common.allFile(config.paths.dist, 'html'),
            common.allFile(config.paths.dist, 'css')])
        .pipe(replace(new RegExp(replaceHtml, 'gm'),
            function (match, seperator, url) {

            for(key in manifest) {
                if (match.indexOf(key) > -1) {
                    return match.replace(url, manifest[key]);
                }
            }
            return match;

        }))
        .pipe(replace(new RegExp(replaceCss, 'gm'),
            function (match, seperator, url) {

            for(key in manifest) {
                if (match.indexOf(key) > -1) {
                    return match.replace(url, manifest[key]);
                }
            }
            return match;

        }))
        .pipe(gulp.dest(config.paths.dist));

};
