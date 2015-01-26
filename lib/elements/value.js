var createPhrase = require('../create-phrase');
var _ = require('lodash');

module.exports = createPhrase({
  name: 'value',
  getDefaultProps: function () {
    return {
      join: false,
      fuzzy: 'all'
    };
  },
  _handleParse: function(options, data, done) {
    var this_ = this;
    var handleStringOptions = {
      join: this.props.join,
      fuzzy: this.props.fuzzy
    };

    var computeData = function(suggestion) {
      var stackEntry;
      var output;
      var value = suggestion.value;
      var text = suggestion.text;

      //if this has a category, use that
      // if not, use the last category on the stack
      handleStringOptions.category = this_.props.category;
      if (!handleStringOptions.category) {
        stackEntry = _.findLast(options.input.stack, 'category');
        handleStringOptions.category = stackEntry ? stackEntry.category : null;
      }

      output = options.input.handleString(text, handleStringOptions);
      if (output !== null) {
        output = output.handleValue(this_.props.id, value);
        if (this_.props.limit) {
          output = options.applyLimit(output);
        }
        data(output);
      }
    };

    return this.props.compute(options.input.text, computeData, done);
  }
});
