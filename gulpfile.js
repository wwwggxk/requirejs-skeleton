var gulp = require('gulp'),
    styleTask = require('./gulp/tasks/style'),
    scriptTask = require('./gulp/tasks/script'),
    imageTask = require('./gulp/tasks/image'),
    hashTask = require('./gulp/tasks/hash'),
    cleanTask = require('./gulp/tasks/clean'),
    cdnTask = require('./gulp/tasks/cdn'),
    htmlTask = require('./gulp/tasks/html');
    replaceTask = require('./gulp/tasks/replace');
    releaseTask = require('./gulp/tasks/release');
    serverTask = require('./gulp/tasks/server');

    gulp.task('clean', cleanTask.clean);

    gulp.task('coreCss', styleTask.coreCss);
    gulp.task('compileCss', styleTask.compileCss);
    gulp.task('css', ['clean'], styleTask.css);

    gulp.task('coreJs', scriptTask.coreJs);
    gulp.task('libs', ['clean'], scriptTask.libs);
    gulp.task('js', ['clean'], scriptTask.js);

    gulp.task('image', ['clean'], imageTask.image);
    gulp.task('html', ['css'], htmlTask.html);
    gulp.task('other', ['clean'], htmlTask.other);

    gulp.task('init', ['coreCss', 'coreJs', 'compileCss']);
    gulp.task('compile', ['libs', 'js', 'image', 'html', 'other']);

    gulp.task('hashAssets', ['compile'], hashTask.hashAssets);
    gulp.task('cdnAssets', ['hashAssets'], cdnTask.cdnAssets);
    gulp.task('replaceAssets', ['cdnAssets'], replaceTask.replaceAssets);

    gulp.task('hash', ['replaceAssets'], hashTask.hash);
    gulp.task('cdn', ['hash'], cdnTask.cdn);
    gulp.task('replace', ['cdn'], replaceTask.replace);

    gulp.task('release', ['replace'], releaseTask.release);
    gulp.task('default', serverTask.local);
