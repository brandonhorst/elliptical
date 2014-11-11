var Element = function(options) {
  this.id = typeof options.id === 'undefined' ? '@temp-' + (Element.tempId) : options.id;
  Element.tempId++;
  this.optional = typeof options.optional === 'undefined' ? false : options.optional;
};

Element.tempId = 0;

Element.prototype.parse = function(input, lang, context, data, done) {
  function handleParseData (output) {
    data(output.stackPop());
  }

  var newInput = input.stackPush(this);

  if (this.optional) {
    handleParseData(newInput);
  }
  this.handleParse(newInput, lang, context, handleParseData, done);
};

Element.prototype.handleParse = function(input, lang, context, data, done) {
  done(Error('You must override abstract method handleParse'));
};

module.exports = Element;
