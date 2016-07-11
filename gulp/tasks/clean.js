var del = require('del'),
    config = require('../config/gulpconfig.json');

module.exports.clean = function () {

    return del([config.paths.dist,
            config.paths.staticFile,
            config.paths.manifestFile,
            config.paths.manifestCdnFile,
            config.paths.manifestAssetsFile,
            config.paths.manifestAssetsCdnFile]);

};
