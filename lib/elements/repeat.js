"use strict";

var _ = require("lodash");
var createPhrase = require("../create-phrase");
var InputOption = require("../input-option");

module.exports = createPhrase({
  name: "repeat",
  getDefaultProps: function getDefaultProps() {
    return {
      max: Number.MAX_VALUE,
      min: 0,
      unique: false
    };
  },
  _handleParse: function _handleParse(input, options, applyLimit, data, done) {
    var _this = this;

    var parsesActive = 0;

    var parseChild = function (input, level) {
      var childData = function (input) {
        var newInputData = input.getData();
        var newResult = _.clone(input.result);
        var ownResult = input.result[_this.props.id] || [];
        var childResult = input.result[_this.props.child.props.id];
        var newInput;
        var continueToSeparator;

        // if the repeat is unique and the childResult already exists in the result,
        // just stop - we will not do this branch
        if (_this.props.unique && ownResult.indexOf(childResult) !== -1) {
          return;
        }

        if (typeof childResult !== "undefined") {
          ownResult.push(childResult);
        }

        // set this repeat's result to the new ownResult
        newResult[_this.props.id] = ownResult;

        // clear out the child's result
        delete newResult[_this.props.child.props.id];

        newInputData.result = newResult;

        newInput = new InputOption(newInputData);

        // store continueToSeparator, in case the call to data data changes newOption
        continueToSeparator = input.suggestion.length === 0;

        // only call data if we are within the min/max repeat range
        if (level >= _this.props.min && level <= _this.props.max) {
          data(newInput);
        }

        // parse the separator
        if (level < _this.props.max && continueToSeparator) {
          parseSeparator(newInput, level);
        }
      };

      var childDone = function (err) {
        if (err) {
          done(err);
        } else {
          parsesActive--;
          if (parsesActive === 0) {
            done();
          }
        }
      };

      parsesActive++;
      _this.props.child.parse(input, options, childData, childDone);
    };

    var parseSeparator = function (input, level) {
      var separatorData = function (option) {
        parseChild(option, level + 1);
      };

      function separatorDone(err) {
        if (err) {
          done(err);
        } else {
          parsesActive--;
          if (parsesActive === 0) {
            done();
          }
        }
      }

      if (_this.props.separator) {
        _this.props.separator.parse(input, options, separatorData, separatorDone);
      } else {
        separatorData(input);
        separatorDone();
      }
    };

    parseChild(input, 1);
  }
});