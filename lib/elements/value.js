var createPhrase = require('../create-phrase');
var InputOption = require('../input-option');
var _ = require('lodash');

module.exports = createPhrase({
  name: 'value',
  getDefaultProps: function () {
    return {
      join: false,
      fuzzy: 'all'
    };
  },
  _handleParse: function(input, options, applyLimit, data, done) {
    var this_ = this;
    var handleStringOptions = {
      join: this.props.join,
      fuzzy: this.props.fuzzy
    };

    var computeData = function(suggestion) {
      var stackEntry;
      var newInput, newResult;

      //if this has a category, use that
      // if not, use the last category on the stack
      handleStringOptions.category = this_.props.category;
      if (!handleStringOptions.category) {
        stackEntry = _.findLast(input.stack, 'category');
        handleStringOptions.category = stackEntry ? stackEntry.category : null;
      }

      newInput = input.handleString(suggestion.text, handleStringOptions);
      if (newInput !== null) {
        newResult = _.clone(input.result);
        newResult[this_.props.id] = suggestion.value;
        newInput.result = newResult;
        if (this_.props.limit) {
          newInput.limit = applyLimit(input);
        }
        data(new InputOption(newInput));
      }
    };

    return this.props.compute(input.text, computeData, done);
  }
});
