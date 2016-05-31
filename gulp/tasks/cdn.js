var gulp = require('gulp'),
    path = require('path'),
    fs = require('fs'),
    common = require('./common'),
    utils = require('../utils'),
    manifestPath = '../.tmp/manifest.json',
    manifestAssetsPath = '../.tmp/manifest-assets.json',
    config = require('../config/gulpconfig.json');

module.exports.cdn = function () {

    var client = utils.Qiniu.init(config.qiniu.accessKey,
                 config.qiniu.secretKey),
        src = [common.allFile(config.paths.distScripts,'js'),
               common.allFile(config.paths.distStyles,'css')],
        manifest = require(manifestPath),
        manifestCdn = {},
        failedFiles = [],
        i = 0;

    return gulp.src(src, {base: config.paths.dist})
        .pipe(common.throughEach(function (file, cb) {

            var key = path.basename(file.relative),
                filePath = path.join(config.paths.dist, file.relative);

            console.log('[' + (++i) + '] uploading ' + filePath);
            client.upload(filePath, config.qiniu.bucket, key)
                .then(function (ret) {
                    console.log('✔︎ upload successfully: ' + filePath);
                    manifestCdn[file.relative] = client.getUrl(config.qiniu.domain, key);
                }, function (err) {
                    failedFiles.push(filePath);
                    console.log('✘ upload failed: ' + filePath);
                    console.log(err);
                }).finally(function () {
                    cb(null, file);
                });

        }, function (cb) {

            Object.keys(manifest).forEach(function (key) {
                var hashFilename = manifest[key];
                if (hashFilename in manifestCdn) {
                    manifestCdn[key] = manifestCdn[hashFilename];
                    delete manifestCdn[hashFilename];
                }
            });
            fs.writeFileSync(config.paths.manifestCdnFile,
                JSON.stringify(manifestCdn, null, '  '));

            console.log('--------------------------------');
            console.log('cdn ok!');
            console.log('success: ' + (i - failedFiles.length) + ', ' +
                        'failed: '  + failedFiles.length);

            if (failedFiles.length) {
                console.log('failed files:');
                failedFiles.forEach(function (file) {
                    console.log(file);
                });
            }

            console.log('--------------------------------');
            cb();

        }));

};

module.exports.cdnAssets = function () {

    var client = utils.Qiniu.init(config.qiniu.accessKey,
                 config.qiniu.secretKey),
        src = [common.allFile(config.paths.distImages, config.ext.image)],
        manifest = require(manifestAssetsPath),
        manifestCdn = {},
        failedFiles = [],
        i = 0;

    return gulp.src(src, {base: config.paths.dist})
        .pipe(common.throughEach(function (file, cb) {

            var key = path.basename(file.relative),
                filePath = path.join(config.paths.dist, file.relative);

            console.log('[' + (++i) + '] uploading ' + filePath);
            client.upload(filePath, config.qiniu.bucket, key)
                .then(function (ret) {
                    console.log('✔︎ upload successfully: ' + filePath);
                    manifestCdn[file.relative] = client.getUrl(config.qiniu.domain, key);
                }, function (err) {
                    failedFiles.push(filePath);
                    console.log('✘ upload failed: ' + filePath);
                    console.log(err);
                }).finally(function () {
                    cb();
                });

        }, function (cb) {

            Object.keys(manifest).forEach(function (key) {
                var hashFilename = manifest[key];
                if (hashFilename in manifestCdn) {
                    manifestCdn[key] = manifestCdn[hashFilename];
                    delete manifestCdn[hashFilename];
                }
            });
            fs.writeFileSync(config.paths.manifestAssetsCdnFile,
                JSON.stringify(manifestCdn, null, '  '));

            console.log('--------------------------------');
            console.log('cdn assets ok!');
            console.log('success: ' + (i - failedFiles.length) + ', ' +
                        'failed: '  + failedFiles.length);

            if (failedFiles.length) {
                console.log('failed files:');
                failedFiles.forEach(function (file) {
                    console.log(file);
                });
            }

            console.log('--------------------------------');
            cb();

        }));

};
