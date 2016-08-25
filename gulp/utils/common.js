/**
 * - check file exists
 * - create file or append default content
 * - join two path
 * - get user input
 *
 * @author wungqiang, wungqiang@gmail.com
 * @motto 每个工程师都有保持代码优雅的义务
 * @date 2016
 */

var fs = require('fs'),
    q = require('q'),
    path = require('path');

module.exports = {
    isExists: function (path) {
        return q.promise(function(resolve, reject) {
            fs.access(path, fs.F_OK, function (err) {
                return err ? reject(err) : resolve();
            });
        });
    },
    createFile: function (path, defaultText) {
        return q.promise(function(resolve, reject) {
            fs.open(path, 'wx', function (err) {
                if (err) {
                    return reject(err);
                }
                if (defaultText) {
                    fs.writeFile(path, defaultText, function (err) {
                        return err ? reject(err) : resolve();
                    })
                } else {
                    resolve();
                }
            });
        });
    },
    joinPath: function (pre, affix) {
        var separator = path.sep || '/';
        pre = pre.charAt(pre.length - 1) === separator ?  pre : (pre + separator);
        affix = affix.charAt(0) === separator ?  affix.slice(1) : affix;

        return pre + affix;
    },
    readInput: function (tip) {
        return q.promise(function (resolve, reject) {
            console.log(tip);
            stdin.addListener("data", function(d) {
                resolve(d.toString().trim());
            });
        });
    }
};
