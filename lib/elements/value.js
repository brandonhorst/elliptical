var createPhrase = require('../create-phrase');
var findLast = require('lodash.findlast');

module.exports = createPhrase({
  name: 'value',
  _handleParse: function(options, data, done) {
    var this_ = this;

    var computeData = function(suggestion) {
      var stackEntry;
      var value = suggestion.value;
      var display = suggestion.display;

      //if this has a category, use that
      // if not, use the last category on the stack
      var category = this_.props.category;
      if (!category) {
        stackEntry = findLast(options.input.stack, 'category');
        category = stackEntry ? stackEntry.category : null;
      }

      var output = options.input.handleString(display, category);
      if (output !== null) {
        output = output.handleValue(this_.props.id, value);
        data(output);
      }
    };

    return this.props.compute(options.input.text, computeData, done);
  }
});
