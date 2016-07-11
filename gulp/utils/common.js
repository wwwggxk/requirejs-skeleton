var fs = require('fs'),
    q = require('q');

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
        pre = pre.charAt(pre.length - 1) === '/' ?  pre : (pre + '/');
        affix = affix.charAt(0) === '/' ?  affix.slice(1) : affix;

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
