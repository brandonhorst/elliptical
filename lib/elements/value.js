"use strict";

var createPhrase = require("../create-phrase");
var InputOption = require("../input-option");
var _ = require("lodash");

module.exports = createPhrase({
  name: "value",
  getDefaultProps: function getDefaultProps() {
    return {
      join: false,
      fuzzy: "all"
    };
  },
  _handleParse: function _handleParse(input, options, applyLimit, data, done) {
    var _this = this;

    var handleStringOptions = {
      join: this.props.join,
      fuzzy: this.props.fuzzy
    };

    var computeData = function (suggestion) {
      var stackEntry;
      var newInput, newResult;

      // if this has a category, use that
      // if not, use the last category on the stack
      handleStringOptions.category = _this.props.category;
      if (!handleStringOptions.category) {
        stackEntry = _.findLast(input.stack, "category");
        handleStringOptions.category = stackEntry ? stackEntry.category : null;
      }

      newInput = input.handleString(suggestion.text, handleStringOptions);
      if (newInput !== null) {
        newResult = _.clone(input.result);
        newResult[_this.props.id] = suggestion.value;
        newInput.result = newResult;
        if (_this.props.limit) {
          newInput.limit = applyLimit(input);
        }
        data(new InputOption(newInput));
      }
    };

    return this.props.compute(input.text, computeData, done);
  }
});