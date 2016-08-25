/**
 * - clear config or tmp directory
 *
 * @author wungqiang, wungqiang@gmail.com
 * @motto 每个工程师都有保持代码优雅的义务
 * @date 2016
 */

var del = require('del'),
    config = require('../config/gulpconfig.json');

module.exports.clean = function () {

    return del([config.paths.dist,
            config.paths.manifestFile,
            config.paths.manifestCdnFile,
            config.paths.manifestAssetsFile,
            config.paths.manifestAssetsCdnFile]);

};
