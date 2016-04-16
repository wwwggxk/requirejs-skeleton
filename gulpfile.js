var gulp = require('gulp'),
    fs = require('fs'),
    q = require('q'),
    path = require('path'),
    del = require('del'),                         // 删除文件或者目录
    rev = require('gulp-rev'),                    // 文件打hash
    gulpif = require('gulp-if'),                  // if判断
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
    cssmin = require('gulp-minify-css'),          // 压缩css
    imagemin = require('gulp-imagemin'),          // 图片处理
    pngquant = require('imagemin-pngquant'),      // 图片处理扩展
    cssAutoprefix = require('gulp-autoprefixer'), // css加前缀

    utils = require('./utils'),                   // 自定义工具
    config = require('./gulpconfig.json'),        // 配置信息


    replaceHtml = "<(?:link|script|)[^>]*?\\s+(?:href|src|data-main)=(?:(\"|'|\\s*)([^\\s]+)\\1)",
        //"replaceStyle": "url\\((\"|\')*.+?\\1\\)"


    replaceInCss = "url\\((\"|\')*.+?\\1\\)",
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
    coreLibs: function () {

        gulp.src(config.paths.srcCoreLibs)
            .pipe(concat(config.paths.distCoreLibsName))
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

        gulp.src(allFile(config.paths.srcScripts))
            .pipe(gulp.dest(config.paths.distScripts));

    },
    buildJs: function () {

        gulp.src(allFile(config.paths.srcScripts, 'js'), {base: '.'})
            .pipe(uglify())
            .pipe(rev())
            .pipe(header(config.header))
            .pipe(gulp.dest(config.paths.dist))
            .pipe(rev.manifest(config.paths.manifestFile, {
                merge: true
            }))
            .pipe(gulp.dest('.'));

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

        gulp.src(allFile(config.paths.srcStyles, 'css'))
            .pipe(cssmin({
                aggressiveMerging: false,
                advanced: false,
                compatibility: 'ie7',
                keepBreaks: true
            }))
            .pipe(gulp.dest(config.paths.distStyles));

    },
    buildCss: function () {

        gulp.src(allFile(config.paths.srcStyles, config.ext.style), {base: '.'})
            .pipe(sass())
            .pipe(cssAutoprefix({
                browsers: config.css.autoprefixBrowsers,
                cascade: false
            }))
            .pipe(cssmin({
                aggressiveMerging: false,
                advanced: false,
                compatibility: 'ie7',
                keepBreaks: false
            }))
            .pipe(rev())
            .pipe(gulp.dest(config.paths.dist))
            .pipe(rev.manifest(config.paths.manifestFile, {
                    merge: true
            }))
            .pipe(gulp.dest('.'));

    },
    html: function () {

        var src = [];
        src.push(allFile(config.paths.srcTemplates), config.paths.srcIndex);
        console.log(src);

        gulp.src(src, {base: './'})
            .pipe(gulp.dest(config.paths.dist));

    },
    buildHtml: function () {

        var src = [];
        src.push(allFile(config.paths.srcTemplates), config.paths.srcIndex);

        gulp.src(src, {base: './'})
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
    buildOthers: function () {

        gulp.src(allFile(config.paths.src, config.ext.meta))
            .pipe(gulp.dest(config.paths.build));

    },
    replace: function () {

        var manifest = require(config.paths.manifestcdnFile);

        gulp.src(allFile(config.paths.dist, 'html'))
            .pipe(replace(new RegExp(replaceHtml, 'gm'),
                function (match, seperator, url) {

                if (manifest[url]) {
                    return match.replace(url, manifest[url]);
                }
                return match;

            }))
            .pipe(gulp.dest(config.paths.dist));

    },
    cdn: function () {

        var client = utils.Qiniu.init(config.qiniu.accessKey,
                     config.qiniu.secretKey),
            src = [allFile(config.paths.distScripts,'js'),
                   allFile(config.paths.distStyles,'css'),
                   allFile(config.paths.distImages, config.ext.image)],
            manifest = require(config.paths.manifestFile),
            manifestcdn = {},
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
                        manifestcdn[file.relative] = client.getUrl(config.qiniu.domain, key);
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
                    if (hashFilename in manifestcdn) {
                        manifestcdn[key] = manifestcdn[hashFilename];
                        delete manifestcdn[hashFilename];
                    }
                });
                fs.writeFileSync(config.paths.manifestcdnFile,
                    JSON.stringify(manifestcdn, null, '  '));

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

        return del([config.paths.dist, config.paths.manifestFile]);

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

        NoServer
            .create(config.paths.dist, {browse: true, port: config.server.port})
            .start().then(tasks.watch);

    },
    // 发布到线上服务器
    release: function () {
        console.log('release');
    },
    // 启动调试服务器，可设置NoServer代理proxy访问测试接口
    default: function () {

        NoServer
            .create(config.server.root, {browse: true, port: config.server.port})
            .start().then(tasks.watch);

    }
};

// 带clean依赖是为方便前清除数据用
gulp.task('coreLibs', ['clean'], tasks.coreLibs);
gulp.task('coreLibs:keep', tasks.coreLibs);
gulp.task('libs', ['clean'], tasks.libs);
gulp.task('libs:keep', tasks.libs);
gulp.task('jshint', ['clean'], tasks.jshint);
gulp.task('jshint:keep', tasks.jshint);
gulp.task('js', ['clean'], tasks.js);
gulp.task('js:keep', tasks.js);
gulp.task('buildJs', ['clean'], tasks.buildJs);
gulp.task('buildJs:keep', tasks.buildJs);
gulp.task('compileCss', ['clean'], tasks.compileCss);
gulp.task('compileCss:keep', tasks.compileCss);
gulp.task('css', ['clean'], tasks.css);
gulp.task('css:keep', tasks.css);
gulp.task('buildCss', ['clean'], tasks.buildCss);
gulp.task('buildCss:keep', tasks.buildCss);
gulp.task('html', ['clean'], tasks.html);
gulp.task('html:keep', tasks.html);
gulp.task('buildHtml', ['clean'], tasks.buildHtml);
gulp.task('buildHtml:keep', tasks.buildHtml);
gulp.task('image', ['clean'], tasks.image);
gulp.task('image:keep', tasks.image);
gulp.task('buildOthers', ['clean'], tasks.buildOthers);
gulp.task('buildOthers:keep', tasks.buildOthers);
gulp.task('clean', tasks.clean);
gulp.task('watch', tasks.watch);
gulp.task('default', tasks.default);

gulp.task('init', ['coreLibs', 'compileCss']);
gulp.task('compile', ['css', 'libs', 'js', 'image', 'html']);
gulp.task('build', ['buildCss',  'libs', 'buildJs', 'image', 'buildHtml']);
gulp.task('cdn', ['build'], tasks.cdn);
gulp.task('replace', ['cdn'], tasks.replace);
gulp.task('alpha', ['replace'], tasks.alpha);
gulp.task('release', ['replace'], tasks.release);
