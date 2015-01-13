var createPhrase = require('../create-phrase');
var _ = require('lodash');

module.exports = createPhrase({
  name: 'value',
  _handleParse: function(options, data, done) {
    var this_ = this;

    var computeData = function(suggestion) {
      var stackEntry;
      var value = suggestion.value;
      var text = suggestion.text;

      //if this has a category, use that
      // if not, use the last category on the stack
      var category = this_.props.category;
      if (!category) {
        stackEntry = _.findLast(options.input.stack, 'category');
        category = stackEntry ? stackEntry.category : null;
      }

      var output = options.input.handleString(text, category);
      if (output !== null) {
        output = output.handleValue(this_.props.id, value);
        data(output);
      }
    };

    return this.props.compute(options.input.text, computeData, done);
  }
});
