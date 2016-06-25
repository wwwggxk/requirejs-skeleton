define(function () {
    function DDialog(idSelector, modal) {
        var selectors = {
            msg: '.msg',
            close: '.close',
            mask: '.dialog-mask'
        },
        self = this;

        this.key = idSelector;
        this.$element = $(idSelector);
        this.$msg = this.$element.find(selectors.msg);
        this.$close = this.$element.find(selectors.close);
        this.$mask = this.$element.find(selectors.mask);

        this.$element.on('click', selectors.close, function (e) {
            if (self.modal) {
                return;
            }
            self.close();
            self.onClose && self.onClose() && (self.onClose = null);
        });

        this.$mask.click(function () {
            if (self.modal) {
                return;
            }
            self.close();
            self.onClose && self.onClose() && (self.onClose = null);
        });

    }

    DDialog.prototype.show = function (msg, modal) {
        if (modal) {
            this.$close.hide();
        } else {
            this.$close.show();
        }
        this.modal = !!modal;
        this.$mask.show();
        this.$msg.length && this.$msg.html(msg);
        this.$element.length && this.$element.show();
    };

    DDialog.prototype.close = function () {
        this.$mask.hide();
        this.$msg.length && this.$msg.html('');
        this.$element.length && this.$element.hide();
    };

    DDialog.instance = (function (idSelector, modal) {
        var instance = {};

        return function (idSelector, modal) {
            return instance[idSelector] && instance[idSelector].key === idSelector
            ? instance[idSelector]
            : (instance[idSelector] = new DDialog(idSelector, modal));
        };
    })();

    return DDialog;
});
