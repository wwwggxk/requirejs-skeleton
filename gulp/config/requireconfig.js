;(function () {
    var config = {
        baseUrl: './js',
        paths: {
            requirejs: "bower_components/requirejs/require",
            jquery: 'bower_components/jquery/jquery.min',
            modernizr: "bower_components/modernizr/modernizr"
        }
    }

    if (typeof MODULE_MAP === 'object') {
        for (var key in MODULE_MAP) {
            config.paths[key] = MODULE_MAP[key];
        }
    }

    requirejs.config(config);
})();
