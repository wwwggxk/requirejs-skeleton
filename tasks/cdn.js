var gulp = require('gulp'),
    fs = require('fs'),
    q = require('q'),
    path = require('path'),
    del = require('del'),                         // 删除文件或者目录
    rev = require('gulp-rev'),                    // 文件打hash
    gulpif = require('gulp-if'),                  // if判断
    merge = require('merge-stream'),              // 合并流
    sass = require('gulp-sass'),                  // sass编译
    through2 = require('through2'),               // 流处理
    inject = require('gulp-inject'),              // 文件引用注入
    jshint = require('gulp-jshint'),              // js语法检查
    header = require('gulp-header'),              // 添加文件头
    NoServer = require('no-server'),              // 前端调试服务器
    uglify = require('gulp-uglify'),              // js压缩
    rename = require('gulp-rename'),              // 重命名
    concat = require('gulp-concat'),              // 合并文件
    htmlmin = require('gulp-htmlmin'),            // html压缩
    plumber = require('gulp-plumber'),            // 防止gulp管道作业回error停止
    replace = require('gulp-replace'),            // 替换文件中字串
    cleanCss = require('gulp-clean-css'),         // 压缩css
    imagemin = require('gulp-imagemin'),          // 图片处理
    pngquant = require('imagemin-pngquant'),      // 图片处理扩展
    cssAutoprefix = require('gulp-autoprefixer'), // css加前缀
    foreach = require('gulp-foreach'),            // 流遍列
    optimize = require('amd-optimize'),           // amd打包

    utils = require('../utils'),                   // 自定义工具
    config = require('../config/gulpconfig.json'); // 配置信息



module.exports = function () {

    var client = utils.Qiniu.init(config.qiniu.accessKey,
                 config.qiniu.secretKey),
        src = [allFile(config.paths.distScripts,'js'),
               allFile(config.paths.distStyles,'css')],
        manifest = require(config.paths.manifestFile),
        manifestCdn = {},
        failedFiles = [],
        i = 0;

    return gulp.src(src, {base: config.paths.dist})
        .pipe(throughEach(function (file, cb) {

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
