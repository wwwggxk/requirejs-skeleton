;(function (global, doc, factory, undefined) {
    'use strict';

    if (typeof define === "function" && define.amd) {
        define(factory);
    } else if ( typeof module !== "undefined" &&
        typeof module.exports !== "undefined" ){
        module.exports = factory();
    } else {
        global["Utils"] = factory();
    }
})(window, document, function () {

  return Keyframes;
});
