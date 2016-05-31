var qiniu = require('qiniu'),
    q = require('q');

var Qiniu = (function() {
    var client = null,
        qiniuClient = null;

    /**
     * 初始化七牛开发者key
     *
     * @param accessKey
     * @param secretKey
     * @return {undefined}
     */
    function init(accessKey, secretKey) {
        qiniu.conf.ACCESS_KEY = accessKey;
        qiniu.conf.SECRET_KEY = secretKey;
    }

    /**
     * 单例获取七牛client实例
     *
     * @return {undefined}
     */
    function getQiniuClient() {
        return qiniuClient ? qiniuClient : (qiniuClient = new qiniu.rs.Client());
    }

    /**
     * 初始化client
     *
     * @return {undefined}
     */
    function initClient() {
        var client = {};

        client.getUrl = function (domain, key) {
            //构建私有空间的链接
            var url = 'http://' + domain + '/' + key,
                policy = new qiniu.rs.GetPolicy();

            return policy.makeRequest(url);
        };

        client.upload = function(filePath, bucket, key, callbackUrl) {

            var extra = new qiniu.io.PutExtra(),

                // 构建上传策略函数
                putPolicy = new qiniu.rs.PutPolicy(bucket + ":" + key),
                defer = q.defer();

            if (callbackUrl) {
                putPolicy.callbackUrl = callbackUrl;
                putPolicy.callbackBody = 'filename=$(fname)&filesize=$(fsize)';
            }

            qiniu.io.putFile(putPolicy.token(), key, filePath, extra, function(err, ret) {
                if (err) {
                    return defer.reject(err);
                }

                defer.resolve(ret);
            });

            return defer.promise;
        };

        ['stat', 'remove'].forEach(function(func) {
            client[func] = function(bucket, key) {
                var defer = q.defer();

                //获取文件信息
                getQiniuClient()[func](bucket, key, function(err, ret) {
                    if (err) {
                        return defer.reject(err);
                    }

                    defer.resolve(ret);
                });

                return defer.promise;
            };
        });

        ['move', 'copy'].forEach(function(func) {
            client[func] = function(bucket, key, newBucket, newKey) {
                var defer = q.defer();

                getQiniuClient()[func](bucket, key, newBucket, newKey, function(err, ret) {
                    if (err) {
                        return defer.reject(err);
                    }

                    defer.resolve(ret);
                });

                return defer.promise;
            };
        });

        return client;
    }

    return {
        init: function (accessKey, secretKey) {
            init(accessKey, secretKey);

            return initClient();
        }
    };
})();

module.exports = Qiniu;
