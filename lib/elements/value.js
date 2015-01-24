var createPhrase = require('../create-phrase');
var _ = require('lodash');

module.exports = createPhrase({
  name: 'value',
  getDefaultProps: function () {
    return {
      join: false
    };
  },
  _handleParse: function(options, data, done) {
    var this_ = this;

    var computeData = function(suggestion) {
      var stackEntry;
      var output;
      var value = suggestion.value;
      var text = suggestion.text;

      //if this has a category, use that
      // if not, use the last category on the stack
      var category = this_.props.category;
      if (!category) {
        stackEntry = _.findLast(options.input.stack, 'category');
        category = stackEntry ? stackEntry.category : null;
      }

      output = options.input.handleString(text, category, this_.props.join);
      if (output !== null) {
        output = output.handleValue(this_.props.id, value);
        output = options.applyLimit(output);
        data(output);
      }
    };

    return this.props.compute(options.input.text, computeData, done);
  }
});
