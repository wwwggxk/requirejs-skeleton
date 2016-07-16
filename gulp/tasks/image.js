var gulp = require('gulp'),
    imagemin = require('gulp-imagemin'),
    pngquant = require('imagemin-pngquant'),
    common = require('./common'),
    config = require('../config/gulpconfig.json');

module.exports.image = function () {

    return gulp.src(common.allFile(config.paths.srcImages, config.task.ext.image))
        .pipe(imagemin({
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            use: [pngquant()]
        }))
        .pipe(gulp.dest(config.paths.distImages));

};
