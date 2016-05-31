// 公用方法
var through2 = require('through2');

/**
 * 目录下所有扩展文件
 *
 * @param path
 * @param ext
 * @return {undefined}
 */
module.exports.allFile = function (path, ext) {
    var fileReg = /\/.+?\..+?$/;
    if (Array.isArray(path)) {
        path.forEach(function (item, index) {
            if (!fileReg.test(item)) {
                path[index] =  path[index] + '/**/*' + (ext ? ('.' + ext) : '');
            }
        });
        return path;
    }
    return path + '/**/*' + (ext ? ('.' + ext) : '');
};

/**
 * 当前目录下所有扩展文件
 *
 * @param path
 * @param ext
 * @return {undefined}
 */
module.exports.childFile = function (path, ext) {
    var fileReg = /\/.+?\..+?$/;
    if (Array.isArray(path)) {
        path.forEach(function (item, index) {
            if (!fileReg.test(item)) {
                path[index] =  path[index] + '/*' + (ext ? ('.' + ext) : '');
            }
        });
        return path;
    }
    return path + '/*' + (ext ? ('.' + ext) : '');
};

/**
 * 排除路径文件
 *
 * @param path
 * @return {undefined}
 */
module.exports.excludeFile = function (path) {
    return '!' + path;
};

/**
 * 流传输过滤
 *
 * @param eachFn, 每个文件执行回调
 * @param endFn, 最后执行回调
 * @return {undefined}
 */
module.exports.throughEach = function (eachFn, endFn) {
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
};
