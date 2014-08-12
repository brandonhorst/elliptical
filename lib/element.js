(function() {
  var Element,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  Element = (function() {
    Element.tempId = 0;

    function Element(options) {
      this.handleParse = __bind(this.handleParse, this);
      var _ref, _ref1;
      this.id = (_ref = options.id) != null ? _ref : '@temp-' + (++this.constructor.tempId);
      this.optional = (_ref1 = options.optional) != null ? _ref1 : false;
    }

    Element.prototype.parse = function(input, lang, context, data, done) {
      if (this.optional) {
        data(input);
      }
      return this.handleParse(input, lang, context, data, done);
    };

    Element.prototype.handleParse = function(input, lang, context, data, done) {
      throw Error('You must override abstract method handleParse');
    };

    return Element;

  })();

  module.exports = Element;

}).call(this);
