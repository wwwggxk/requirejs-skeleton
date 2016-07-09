;(function (global, document, factory, undefined) {
    'use strict';

    var moduleName = 'Promise';
    if (typeof define === "function" && define.amd) {
        define(factory);
    } else if ( typeof module !== "undefined" &&
        typeof module.exports !== "undefined" ){
        module.exports = factory();
    } else {
        global[moduleName] = factory();
    }
})(window, document, function () {

  function Promise(fn) {
    if (!this instanceof Promise) {
      return new Promise(fn);
    }

    this.status = '';
    this.thens = [];
    this.fn = typeof fn === 'function' ? fn : function (resolve, reject) {
      !!fn ? resolve(fn) : reject(fn);
    };
  }

  Promise.prototype.then = function (resolve, reject) {
    this.thens.push({resolve: resolve, reject: reject});
    if (this.thens.length) {
      setTimeout(this.run.bind(this), 1);
    }
    return this;
  };

  Promise.prototype.finally = function (fn) {
    this.endFn = fn;
    return this;
  };

  Promise.prototype.getHandler = function (method) {
    return function (data) {
      var next = this.thens.shift(),
        result;

      if (!next) {
        return;
      }

      this.status = 'PENDING';
      if (!typeof next[method] !== 'function') {
        return;
      }
      result = next[method].call(this, data);
      if (typeof result === 'undefined') {
        if (this.endFn) {
          this.endFn();
        }
        return;
      }

      if (result instanceof Promise) {
        this.fn.call(this, this.getHandler('resolve').bind(this),
          this.getHandler('reject').bind(this));
      }

      this[method].call(this, result);
    };
  };

  Promise.prototype.run = function () {
    if (this.status === 'PENDING') {
      return;
    }

    if (this.fn) {
      this.status = 'PENDING';
      this.fn.call(this, this.getHandler('resolve').bind(this),
        this.getHandler('reject').bind(this));
    }
  };

  return Promise;
});
