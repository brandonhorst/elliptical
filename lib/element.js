var util = require('./util');

var Element = function(options) {
  this.id = typeof options.id === 'undefined' ? '@temp-' + (Element.tempId) : options.id;
  this.category = options.category || null;
  this.optional = typeof options.optional === 'undefined' ? false : options.optional;
  Element.tempId++;
};

Element.tempId = 0;

Element.prototype.parse = function(options, data, done) {
  function handleParseData (output) {
    data(output.stackPop());
  }

  var newOptions = util.clone(options);

  newOptions.input = options.input.stackPush(this);

  if (this.optional) {
    handleParseData(newOptions.input);
  }

  this.handleParse(newOptions, handleParseData, done);
};

Element.prototype.handleParse = function(options, data, done) {
  done(Error('You must override abstract method handleParse'));
};

module.exports = Element;
