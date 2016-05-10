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

    utils = require('./utils'),                   // 自定义工具
    config = require('./config/gulpconfig.json'), // 配置信息


    //replaceHtml = "<(?:link|script|)[^>]*?(?:\\s+(?:href|src|data-main)=(?:(\"|'|\\s*)([^\\s]+)\\1))+",
    replaceHtml = "(?:href|src|data-main)=(?:(\"|'|\\s*)([^\\s]+)\\1)",
    replaceCss = "url\\((\"|'?)(.+?)(\\1)\\)",
    tasks;

/*********************************************************************公用方法*/

/**
 * 目录下所有扩展文件
 *
 * @param path
 * @param ext
 * @return {undefined}
 */
function allFile(path, ext) {
    return path + '/**/*' + (ext ? ('.' + ext) : '');
}

/**
 * 当前目录下所有扩展文件
 *
 * @param path
 * @param ext
 * @return {undefined}
 */
function childFile(path, ext) {
    return path + '/*' + (ext ? ('.' + ext) : '');
}

/**
 * 排除路径文件
 *
 * @param path
 * @return {undefined}
 */
function excludeFile(path) {
    return '!' + path;
}

/**
 * 流传输过滤
 *
 * @param eachFn, 每个文件执行回调
 * @param endFn, 最后执行回调
 * @return {undefined}
 */
function throughEach(eachFn, endFn) {
    return through2.obj(function (file, encoding, cb) {
        if (eachFn) {
            return eachFn.call(this, file, cb);
        }

        cb(null, file);
    }, function (cb) {
        if (endFn) {
            return endFn.call(this, cb);
        }

        cb();
    });
}

/*************************************************************************任务*/

tasks = {
    coreCssLibs: function () {

        return gulp.src(config.paths.srcCoreCssLibs)
            .pipe(concat(config.paths.coreCssLibsName))
            .pipe(gulp.dest(config.paths.srcStyles));

    },
    coreJsLibs: function () {

        var corePath = path.join(config.paths.srcScripts, config.paths.coreJsLibsName);
        console.log(corePath);
        return gulp.src(corePath)
            .pipe(optimize('core', {
                configFile: config.paths.requireConfigFile
            }))
            .pipe(concat('core.js'))
            .pipe(uglify())
            .pipe(header(config.header))
            .pipe(gulp.dest(config.paths.srcScripts));

    },
    libs: function () {

        config.paths.srcOtherLibs.forEach(function (item) {

            var stat = fs.statSync(item),
                src = stat.isDirectory() ? allFile(item) : item,
                dest = stat.isDirectory() ?
                    path.join(config.paths.distLibs, path.basename(item)) :
                    config.paths.distLibs;

            gulp.src(src) .pipe(gulp.dest(dest));

        });

    },
    jshint: function () {

        gulp.src(allFile(config.paths.srcScripts, config.ext.scripts))
            .pipe(jshint())
            .pipe(jshint.reporter('default', {
                    fail: true
                }))
            .pipe(jshint.reporter('fail'));

    },
    js: function () {

        var corePath = path.join(config.paths.srcScripts, config.paths.coreJsLibsName);

        gulp.src(corePath).pipe(gulp.dest(config.paths.distScripts));
        gulp.src([childFile(config.paths.srcScripts, 'js')].concat(excludeFile(corePath)))
            .pipe(foreach(function (stream, file) {
                return stream.pipe(optimize(file.relative.replace(/\.js/, ''), {
                            baseUrl: config.paths.srcScripts
                        }))
                        .pipe(concat(path.basename(file.relative)))
                        .pipe(uglify())
                        .pipe(header(config.header))
                        .pipe(gulp.dest(config.paths.distScripts));
            }));

    },
    compileCss: function () {

        gulp.src(allFile(config.paths.srcStyles, config.ext.style))
            .pipe(sass())
            .pipe(cssAutoprefix({
                browsers: config.css.autoprefixBrowsers,
                cascade: false
            }))
            .pipe(NoServer.streamReloadCss())
            .pipe(gulp.dest(config.paths.srcStyles));

    },
    css: function () {

        var cssStream = gulp.src(allFile(config.paths.srcStyles,
                config.ext.style), {base: '.'})
            .pipe(sass())
            .pipe(cssAutoprefix({
                browsers: config.css.autoprefixBrowsers,
                cascade: false
            }))
            .pipe(cleanCss({
                aggressiveMerging: false,
                advanced: false,
                compatibility: 'ie7',
                keepBreaks: false
            })),

            coreStream = gulp.src(path.join(config.paths.srcStyles,
                config.paths.coreCssLibsName))
                .pipe(cleanCss({
                    keepSpecialComments: 0
                }));

        return merge(coreStream, cssStream)
            .pipe(concat(config.paths.mainCssName))
            .pipe(gulp.dest(config.paths.distStyles));

    },
    html: function () {

        var mergedStyle = path.join(config.paths.distStyles,
                config.paths.mainCssName);

        return gulp.src(config.paths.srcIndex)
            .pipe(inject(gulp.src(mergedStyle), {
                relative: true,
                ignorePath: config.paths.dist
            }))
            .pipe(gulpif(config.ga.enabled,
                replace(config.ga.key,
                    config.ga.script.replace(config.ga.placeholder,
                        config.ga.trackingId))))
            .pipe(htmlmin({
                collapseWhitespace: true,
                removeComments: true
            }))
            .pipe(gulp.dest(config.paths.dist));

    },
    image: function () {

        return gulp.src(allFile(config.paths.srcImages, config.ext.image))
            .pipe(imagemin({
                progressive: true,
                svgoPlugins: [{removeViewBox: false}],
                use: [pngquant()]
            }))
            .pipe(gulp.dest(config.paths.distImages));

    },
    others: function () {

        gulp.src(allFile(config.paths.src, config.ext.meta))
            .pipe(gulp.dest(config.paths.dist));

    },
    hash: function () {
        var src = [allFile(config.paths.distStyles, 'css'),
                    allFile(config.paths.distScripts, 'js')],
            base = './dist';

        return gulp.src(src, {base: base})
            .pipe(rev())
            .pipe(gulp.dest(config.paths.dist))
            .pipe(throughEach(function (file, cb) {
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

    },
    replaceAssets: function () {

        var manifest = require(config.paths.manifestAssetsFile), key;

        return gulp.src([allFile(config.paths.dist, 'html'),
                allFile(config.paths.dist, 'js'),
                allFile(config.paths.dist, 'css')])
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

    },
    replace: function () {

        var manifest = require(config.paths.manifestCdnFile), key;

        return gulp.src([allFile(config.paths.dist, 'html'),
                allFile(config.paths.dist, 'css')])
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

    },
    cdnAssets: function () {

        var client = utils.Qiniu.init(config.qiniu.accessKey,
                     config.qiniu.secretKey),
            src = [allFile(config.paths.distImages, config.ext.image)],
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
                        cb();
                    });

            }, function (cb) {

                fs.writeFileSync(config.paths.manifestAssetsFile,
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

    },
    cdn: function () {

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

    },
    clean: function () {

        return del([config.paths.dist, config.paths.manifestFile,
                config.paths.manifestCdnFile,
                config.paths.manifestAssetsFile]);

    },
    watch: function () {
        gulp.watch(allFile(config.paths.base, config.ext.html),
            NoServer.reloadAll);
        gulp.watch(allFile(config.paths.srcScripts, 'js'),
            NoServer.reloadAll);
        gulp.watch(allFile(config.paths.srcImages, config.ext.image),
            NoServer.reloadAll);
        gulp.watch(allFile(config.paths.srcStyles, config.ext.style),
            ['compileCss:keep']);
    },
    // 上线前测试，可设置NoServer代理proxy访问线上接口
    alpha: function () {

        // config proxy
        NoServer
            .create(config.paths.dist, {browse: true, port: config.server.port})
            .start().then(tasks.watch);

    },
    // 发布到线上服务器
    release: function () {

        //var serverOptions = config.release.serverWithKey;
        //serverOptions.privateKey = fs.readFileSync(serverOptions.privateKey);

        //utils.Shell.ssh(serverOptions).then(function (client) {
            //// reboot server...
            //utils.Shell.exec('ls', client).then(function () {
            //});
        //}, function (err) {
            //console.log(err);
        //});

        utils.Shell.exec('rsync -avz ./dist/* pi:~/www/h5').then(function () {
            console.log('发布成功');
        });

    },
    // 启动调试服务器，可设置NoServer代理proxy访问测试接口
    default: function () {

        NoServer
            .create(config.server.root, {browse: true, port: config.server.port})
            .start().then(tasks.watch);

    }
};

// 带clean依赖是为方便前清除数据用
gulp.task('coreCssLibs', ['clean'], tasks.coreCssLibs);
gulp.task('coreCssLibs:keep', tasks.coreCssLibs);
gulp.task('coreJsLibs', ['clean'], tasks.coreJsLibs);
gulp.task('coreJsLibs:keep', tasks.coreJsLibs);
gulp.task('libs', ['clean'], tasks.libs);
gulp.task('libs:keep', tasks.libs);
gulp.task('jshint', ['clean'], tasks.jshint);
gulp.task('jshint:keep', tasks.jshint);
gulp.task('js', ['clean'], tasks.js);
gulp.task('js:keep', tasks.js);
gulp.task('compileCss', ['clean'], tasks.compileCss);
gulp.task('compileCss:keep', tasks.compileCss);
gulp.task('css', ['clean'], tasks.css);
gulp.task('css:keep', tasks.css);
gulp.task('image', ['clean'], tasks.image);
gulp.task('image:keep', tasks.image);
gulp.task('others', ['clean'], tasks.others);
gulp.task('others:keep', tasks.others);
gulp.task('clean', tasks.clean);
gulp.task('watch', tasks.watch);
gulp.task('default', tasks.default);

gulp.task('init', ['coreCssLibs', 'coreJsLibs', 'compileCss']);
gulp.task('html', ['css'], tasks.html);
gulp.task('compile', ['libs', 'js', 'image', 'html']);
// 先发布图片等资源
gulp.task('cdnAssets', ['compile'], tasks.cdnAssets);
// 替换图片地址
gulp.task('replaceAssets', ['cdnAssets'], tasks.replaceAssets);
// 给文件加hash
gulp.task('hash', ['replaceAssets'], tasks.hash);
// 上传cdn(前面图片等资源除外)
gulp.task('cdn', ['hash'], tasks.cdn);
// 替换cdn地址
gulp.task('replace', ['cdn'], tasks.replace);
// 本地模拟线上环境测试
gulp.task('alpha', ['replace'], tasks.alpha);
// 上线
gulp.task('release', ['replace'], tasks.release);
