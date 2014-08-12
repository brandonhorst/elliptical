(function() {
  var Element, Value, _,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  _ = require('lodash');

  Element = require('./element');

  Value = (function(_super) {
    __extends(Value, _super);

    function Value(options, scope) {
      Value.__super__.constructor.call(this, options);
      this.options = options;
      this.scope = scope;
    }

    Value.prototype.handleParse = function(input, lang, context, data, done) {
      return this.scope[this.options.compute].call(context, input.text, (function(_this) {
        return function(suggestion) {
          var display, output, value;
          value = suggestion.value, display = suggestion.display;
          output = input.handleString(display, _this.partOfSpeech);
          if (output != null) {
            output = output.handleValue(_this.id, value);
            return data(output);
          }
        };
      })(this), done);
    };

    return Value;

  })(Element);

  module.exports = Value;

}).call(this);
