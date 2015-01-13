var createPhrase = require('../create-phrase');

module.exports = createPhrase({
  name: 'value',
  _handleParse: function(options, data, done) {
    var this_ = this;

    var computeData = function(suggestion) {
      var value = suggestion.value;
      var display = suggestion.display;

      var output = options.input.handleString(display, this_.category);
      if (output !== null) {
        output = output.handleValue(this_.props.id, value);
        data(output);
      }
    };

    return this.props.compute(options.input.text, computeData, done);
  }
});
