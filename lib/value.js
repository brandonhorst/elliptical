var Element = require('./element');

var util = require('util');

var Value = function(options, scope) {
  'use strict';
  Value.super_.call(this, options);
  this.options = options;
  this.scope = scope;
};

util.inherits(Value, Element);

Value.prototype.handleParse = function(input, lang, context, data, done) {
  'use strict';
  var this_ = this;

  var scopeData = function(suggestion) {
    var value = suggestion.value;
    var display = suggestion.display;

    var output = input.handleString(display, this_.partOfSpeech);
    if (output !== null) {
      output = output.handleValue(this_.id, value);
      data(output);
    }
  };

  return this.scope[this.options.compute].call(context, input.text, scopeData, done);
};

module.exports = Value;
