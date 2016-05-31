var shell = require('shelljs'),
    q = require('q'),
    ssh2 = require('ssh2');

var Shell = (function () {

    /**
     * 执行本地命令, 如果传入client则在client上执行命令
     *
     * @param cmd
     * @param client
     * @return {undefined}
     */
    function exec(cmd, client) {

        var defer = q.defer();

        if (client) {
            return execRemote(cmd, client);
        }

        var child = shell.exec(cmd, function (err, stdout, stderr) {
            if (err) {
                return defer.reject(stderr);
            }

            defer.resolve();
        });

        return defer.promise;

    }

    /**
     * 在client执行命令
     *
     * @param cmd
     * @param client
     * @return {undefined}
     */
    function execRemote(cmd, client) {

        var defer = q.defer();

        client.exec(cmd, function (err, stream) {

            if (err) {
                return defer.reject(err);
            }

            stream
                .on('close', function (code, signal) {
                    defer.resolve(code, signal);
                })
                .on('data', function (data) {
                    console.log(data.toString());
                })
                .stderr.on('data', function (data) {
                    console.log(data.toString());
                });

        });

        return defer.promise;

    }

    /**
     * ssh到config指定的机器上
     *
     * @param config
     * @return {undefined}
     */
    function ssh(config) {

        if (arguments.length > 1) {
            return sshHopping.apply(null, arguments);
        }

        var defer = q.defer(), client = new ssh2.Client();

        client
            .on('ready', function () {
                defer.resolve(client);
            })
            .on('error', function (err) {
                defer.reject(err);
            })
            .connect(config);

        return defer.promise;

    }

    function sshHopping() {
        var defer = q.defer();
        for (var i = 0; i < arguments.length; i++) {
            //ssh(arguments[i]).then(function (client) {
            //});
        }

        return defer.promise;
    }

    return {
        exec: exec,
        ssh: ssh
    };

})();

module.exports = Shell;
