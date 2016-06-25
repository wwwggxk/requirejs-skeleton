var gulp = require('gulp'),
    path = require('path'),
    fs = require('fs'),
    common = require('./common'),
    utils = require('../utils'),
    staticConfigFilePath = path.join(__dirname, '../../static.json'),
    manifestPath = path.join(__dirname, '../.tmp/manifest.json'),
    manifestAssetsPath = path.join(__dirname, '../.tmp/manifest-assets.json'),
    config = require('../config/gulpconfig.json');

module.exports.cdn = function (cb) {

    if (!config.cdn.enable) {
        return cb();
    }

    utils.Common.isExists(staticConfigFilePath).then(cdnFunc(cb), function () {
        utils.Common.createFile(staticConfigFilePath, '{}').then(cdnFunc(cb),
        function () {
            console.log('create file failed: ', staticConfigFilePath);
        });
    });

};

function cdnFunc(callback) {

    return function () {
        utils.Common.isExists(manifestPath).then(function () {

            var client = utils.Qiniu.init(config.qiniu.accessKey,
                         config.qiniu.secretKey),
                src = [common.allFile(config.paths.distScripts,'js'),
                       common.allFile(config.paths.distStyles,'css')],
                staticConfig = require(staticConfigFilePath),
                manifest = require(manifestPath),
                manifestCdn = {},
                failedFiles = [],
                historyFiles = [],
                i = 0;

            return gulp.src(src, {base: config.paths.dist})
                .pipe(common.throughEach(function (file, cb) {

                    var key = path.basename(file.relative),
                        filePath = path.join(config.paths.dist, file.relative),
                        itemKey;

                    // 已经传过的不再上传cdn
                    if (config.cdn.optimize) {
                        for (itemKey in staticConfig) {
                            if (staticConfig[itemKey].hash === file.relative) {
                                console.log('✔︎ skip: ' + filePath);
                                historyFiles.push(filePath);
                                return cb();
                            }
                        }
                    }

                    console.log('[' + (++i) + '] uploading ' + filePath);
                    client.upload(filePath, config.qiniu.bucket, key)
                        .then(function (ret) {
                            var url = client.getUrl(config.qiniu.domain, key);
                            console.log('✔︎ upload successfully: ' + filePath);
                            manifestCdn[file.relative] = url;
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
                            staticConfig[key] = {
                                hash: hashFilename,
                                cdn: manifestCdn[hashFilename]
                            };
                            delete manifestCdn[hashFilename];
                        }
                    });
                    fs.writeFileSync(config.paths.manifestCdnFile,
                        JSON.stringify(manifestCdn, null, '  '));
                    fs.writeFileSync(config.paths.staticConfigFile,
                        JSON.stringify(staticConfig, null, '  '));

                    console.log('--------------------------------');
                    console.log('cdn ok!');
                    console.log('success: ' +
                                (i - failedFiles.length) + ', ' +
                                'skip: '  +
                                historyFiles.length + ', ' +
                                'failed: '  +
                                failedFiles.length);

                    if (failedFiles.length) {
                        console.log('failed files:');
                        failedFiles.forEach(function (file) {
                            console.log(file);
                        });
                    }

                    console.log('--------------------------------');
                    cb();
                    callback();

                }));

        }, function () {
            console.log('skip: cdn');
            callback();
        });
    };
}

module.exports.cdnAssets = function (cb) {

    if (!config.cdn.enable) {
        return cb();
    }

    utils.Common.isExists(staticConfigFilePath).then(cdnAssetsFunc(cb), function () {
        utils.Common.createFile(staticConfigFilePath, '{}').then(cdnAssetsFunc(cb),
        function () {
            console.log('create file failed: ', staticConfigFilePath);
        });
    });

};

function cdnAssetsFunc(callback) {

    return function () {
        utils.Common.isExists(manifestAssetsPath).then(function () {
            var client = utils.Qiniu.init(config.qiniu.accessKey,
                         config.qiniu.secretKey),
                src = [common.allFile(config.paths.distImages, config.ext.image)],
                staticConfig = require(staticConfigFilePath),
                manifest = require(manifestAssetsPath),
                manifestCdn = {},
                failedFiles = [],
                historyFiles = [],
                i = 0;

            return gulp.src(src, {base: config.paths.dist})
                .pipe(common.throughEach(function (file, cb) {

                    var key = path.basename(file.relative),
                        filePath = path.join(config.paths.dist, file.relative),
                        itemKey;

                    // 已经传过的不再上传cdn
                    if (config.cdn.optimize) {
                        for (itemKey in staticConfig) {
                            if (staticConfig[itemKey].hash === file.relative) {
                                console.log('✔︎ skip: ' + filePath);
                                historyFiles.push(filePath);
                                return cb();
                            }
                        }
                    }

                    console.log('[' + (++i) + '] uploading ' + filePath);
                    client.upload(filePath, config.qiniu.bucket, key)
                        .then(function (ret) {
                            var url = client.getUrl(config.qiniu.domain, key);
                            console.log('✔︎ upload successfully: ' + filePath);
                            manifestCdn[file.relative] = url;
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
                            staticConfig[key] = {
                                hash: hashFilename,
                                cdn: manifestCdn[hashFilename]
                            };
                            delete manifestCdn[hashFilename];
                        }
                    });
                    fs.writeFileSync(config.paths.manifestAssetsCdnFile,
                        JSON.stringify(manifestCdn, null, '  '));
                    fs.writeFileSync(config.paths.staticConfigFile,
                        JSON.stringify(staticConfig, null, '  '));

                    console.log('--------------------------------');
                    console.log('cdn assets ok!');
                    console.log('success: ' +
                                (i - failedFiles.length) + ', ' +
                                'skip: '  +
                                historyFiles.length + ', ' +
                                'failed: '  +
                                failedFiles.length);

                    if (failedFiles.length) {
                        console.log('failed files:');
                        failedFiles.forEach(function (file) {
                            console.log(file);
                        });
                    }

                    console.log('--------------------------------');
                    cb();
                    callback();

                }));
        }, function () {
            console.log('skip: cdn assets');
            callback();
        });

    };
}
