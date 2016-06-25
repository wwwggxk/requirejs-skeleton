define(['./utils'], function () {

    (function(global, Utils, Struct, undefined) {

        var lastTime = 0,
            fps = 60,
            nextFrame = Utils.animationFrame.request,
            cancelFrame = Utils.animationFrame.cancel,
            transform = Utils.cssTest('transform');

        function ease(t, b, c, d){
            return -c * (( t = t / d - 1) * t * t * t - 1 ) + b;
        }

        function linear(t, b, c, d){  //匀速
            return c * t / d + b;
        }

        Struct.prototype = {
            constructor: Struct,

            stop: function (cb) {
                this.resetted = false;
                this.stopped = true;
            },

            reset: function () {
                this.stopped = false;
                this.resetted = true;
                this.animate();
            },

            stopTo: function (angle) {
                this.stopped = true;
                this.resetted = false;
                this.stopAngle = angle;
                this.animate();
            },

            stopAt: function (index) {
                var len = this.awardsCount;
                this.stopped = true;
                this.resetted = false;
                this.stopAngle = 360 / len * (index % len);
                this.animate();
            },

            resume: function () {
                this.stopped = false;
                //this.resetted = false;
                this.resumed = true;
                this.animate();
            },

            slide: function (speed, max) {
                if (!transform) {
                    return;
                }
                this.top = 0;
                this.speed = speed;
                this.max = max;
                this.animateSlide();
            },

            animateSlide: function (speed) {
                var self = this, nextTop;

                cancelFrame(self.timer);

                nextTop = self.top + self.speed;
                if (nextTop >= (self.max / 2)) {
                    nextTop = 0;
                }

                self.setTop(nextTop);
                self.top = nextTop;
                self.timer = nextFrame(self.animateSlide.bind(self));
            },
            setTop: function (value) {
                var self = this,
                    matrix = Utils.getStyle(self.elem)[transform],
                    prev = matrix.replace(/matrix\(|\)/gi, '').split(',');

                prev[0] = 1;
                prev[1] = 0;
                prev[2] = 0;
                prev[3] = 1;
                prev[4] = 0;
                prev[5] =  - value;
                self.elem.style[transform] = 'matrix('+ prev.join(', ') +')';
            },

            lottery: function(awardsCount, speed, callback) {
                if (!transform) {
                    return;
                }
                this.options = {
                    minCircles: 3
                };
                this.awardsCount = awardsCount;
                this.speed = speed;
                this.callback = callback;
                this.circle = 0;
                this.angle = 0;
                this.animate();

            },
            setAngle: function (value) {
                var self = this,
                    matrix = Utils.getStyle(self.elem)[transform],
                    prev = matrix.replace(/matrix\(|\)/gi, '').split(',');

                // matrix: cos, sin, -sin, cos, 0, 0
                var angle = value / 360 * 2 * Math.PI;
                prev[0] = Math.cos(angle);
                prev[1] = Math.sin(angle);
                prev[2] = -prev[1];
                prev[3] = prev[0];
                prev[4] = 0;
                prev[5] = 0;
                self.angle = value;
                self.elem.style[transform] = 'matrix('+ prev.join(', ') +')';
            },
            animate: function() {
                var self = this, nextAngle;

                cancelFrame(self.timer);

                // 重置时减速
                if (self.stopped && (self.resetted || self.stopAngle)) {
                    self.speed -= 0.1;
                    self.speed = self.speed || 0.1;
                    if ((self.angle < self.stopAngle) &&
                        (self.stopAngle - self.angle <  self.speed) &&
                        self.circle >= self.options.minCircles) {

                        self.setAngle(self.stopAngle);
                        return self.callback(self.stopAngle / (360 / self.awardsCount));
                    }
                }

                // 至少转minCircles转
                if (self.stopped && self.stopAngle === 0 && self.circle >= self.options.minCircles) {
                    self.callback(self.stopAngle / (360 / self.awardsCount));
                    return;
                }

                nextAngle = self.angle + self.speed;
                if (nextAngle >= 360) {
                    nextAngle = 0;
                    self.circle ++;
                }

                self.setAngle(nextAngle);
                self.timer = nextFrame(self.animate.bind(self));
            }
        };


        //if(typeof define=='function' && define.amd){
           //define('Animation', [], function(){
               //return Struct;
           //});
       //} else {
           global.Animation = Struct;
       //}

    })(window, Utils, function(elem) {
        this.elem = elem;
    });
});
