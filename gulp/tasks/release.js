/**
 * - release files using shell command
 *
 * @author wungqiang, wungqiang@gmail.com
 * @motto 每个工程师都有保持代码优雅的义务
 * @date 2016
 */

var utils = require('../utils');

module.exports.release = function () {

    //var serverOptions = config.release.serverWithKey;
    //serverOptions.privateKey = fs.readFileSync(serverOptions.privateKey);

    //utils.Shell.ssh(serverOptions).then(function (client) {
        //// reboot server...
        //utils.Shell.exec('ls', client).then(function () {
        //});
    //}, function (err) {
        //console.log(err);
    //});

    //utils.Shell.exec('rsync -avz ./dist/* pi:~/www/h5').then(function () {
        //console.log('发布成功');
    //});

};
