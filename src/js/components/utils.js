;(function (global, factory) {
    'use strict';

    if (typeof define === "function" && define.amd) {
        define(factory);
    } else if ( typeof module !== "undefined" &&
        typeof module.exports !== "undefined" ){
        module.exports = factory();
    } else {
        global["Utils"] = factory();
    }

})(window, function() {
    'use strict';

    var root = this,
        doc = window.document,
        styles = doc.createElement('div').style,
        toString = Object.prototype.toString,
        slice = Array.prototype.slice.call,
        class2type = {};

    // 简单定义构造函数
    var Utils = function(obj) {
        if (obj instanceof Utils) return obj;
        if(!(this instanceof Utils)) return new Utils(obj);
    }

    Utils.VERSION = '1.0.0';

    // 将css属性值转换为js特性值 例如 -webkit-transform --> WebkitTransform   padding-top --> paddingTop
    Utils.camelCase = function(str) {
        return (str + '').replace(/^-ms-/, 'ms-').replace(/-([a-z]|[0-9])/ig, function(all, letter) {
            return (letter + '').toUpperCase();
        })
    };

    // 返回浏览器支持的内核前缀，如在webkit内核浏览器中，会返回 -webkit-
    Utils.cssVendor = function() {
        var tests = '-webkit- -moz- -o- -ms-'.split(' '),
            prop;

        while(prop = tests.shift()) {
            if (Utils.camelCase(prop + 'transform') in styles) {
                return prop;
            }
        }
        return '';
    };

    // 返回当前浏览器支持的css属性对应的js特性值
    Utils.cssTest = function(name) {
        var prop = Utils.camelCase(name),
           _prop = Utils.camelCase(Utils.cssVendor + prop);
        return (prop in styles) && prop || (_prop in styles) && _prop || '';
    }

    Utils.getStyle = function (elem) {
        return window.getComputedStyle &&
            window.getComputedStyle(elem, null) ||
            elem.currentStyle ||
            elem.style;
    };

    Utils.animationFrame = {
        request: window.requestAnimationFrame       ||
                 window.webkitRequestAnimationFrame ||
                 window.mozRequestAnimationFrame    ||
                 window.msRequestAnimationFrame     ||
                 function(callback) {
                     var currTime = + new Date,
                         delay = Math.max(1000/60, 1000/60 - (currTime - lastTime));
                     lastTime = currTime + delay;
                     return setTimeout(callback, delay);
                 },
        cancel: window.cancelAnimationFrame              ||
                window.webkitCancelAnimationFrame        ||
                window.webkitCancelRequestAnimationFrame ||
                window.mozCancelRequestAnimationFrame    ||
                window.msCancelRequestAnimationFrame     ||
                clearTimeout
    };

    // 精确判断数据类型
    Utils.type = function(elem) {
        if (elem == null) return elem + '';
        return toString.call(elem).replace(/[\[\]]/g, '').split(' ')[1].toLowerCase();
    }

    // 当elem是数组/类数组时返回true
    Utils.isArrayLike = function(elem) {
        var tp = Utils.type(elem);
        return !!elem && tp != 'function' && tp != 'string' && (elem.length === 0 || elem.length && (elem.nodeType == 1 || (elem.length - 1) in elem));
    }

    // 遍历方法，arr表示被遍历的对象  iterate回调函数有三个参数，分别表示 value key arr.
    Utils.each = function(arr, iterate) {
        if (Utils.isArrayLike(arr)) {
            if (Utils.type(arr.forEach) == 'function') {
                return arr.forEach(iterate);
            }
            var i = 0,
                len = arr.length,
                item;
            for(; i<len; i++) {
                item = arr[i];
                if(type(item) != 'undefined') {
                    iterate(item, i, arr);
                }
            }
        } else {
            for(var key in arr) {
                iterate(arr[key], key, arr);
            }
        }
    }

    // 获取/设置元素的属性  当props时一个字符串时，表示获取  当props是一个对象是，表示设置
    Utils.css = function(elem, props) {
        var transform = this.cssTest('transform');
        var style = window.getComputedStyle && window.getComputedStyle(elem, null) || elem.currentStyle || elem.style;
        if (Utils.type(props) == 'string') {
            switch (props) {
                case 'translateX':
                    if (style[transform] == 'none') return 0;
                    return parseInt(style[transform].replace(/matrix\(|\)/gi, '').split(',')[4]);
                    break;
                case 'translateY':
                    if (style[transform] == 'none') return 0;
                    return parseInt(style[transform].replace(/matrix\(|\)/gi, '').split(',')[5]);
                case 'rotate':
                    if (style[transform] == 'none') return 0;
                    var value = style[transform].replace(/matrix\(|\)/gi, '').split(',')[1];
                    return Math.asin(value) * 180 / Math.PI + 1;
                default:
                    return style[props];

            }
        } else if(Utils.type(props) == 'object') {
            Utils.each(props, function(value, key) {
                var prop;
                switch (key) {
                    case 'opacity':
                        elem.style.filter = 'alpha(opacity:'+ value +')';
                        elem.style.opacity = value/100;
                        break;
                    case 'translateX':
                        var matrix = style[transform];
                        var prev = matrix.replace(/matrix\(|\)/gi, '').split(',');
                        prev[4] = value;
                        var _matrix = 'matrix('+ prev.join(', ') +')';
                        elem.style[transform] = _matrix;
                        break;
                    case 'translateY':
                        var matrix = style[transform];
                        var prev = matrix.replace(/matrix\(|\)/gi, '').split(',');
                        prev[5] = value;
                        var _matrix = 'matrix('+ prev.join(', ') +')';
                        elem.style[transform] = _matrix;
                        break;
                    default:
                        prop = Utils.camelCase(key);
                        elem.style[prop] = value;
                }
            })
        }
    }

    return Utils;

});
