var createPhrase = require('../create-phrase');

var _ = require('lodash');

module.exports = createPhrase({
  name: 'repeat',
  getDefaultProps: function () {
    return {
      max: Number.MAX_VALUE,
      min: 0,
      unique: false
    };
  },
  _handleParse: function(options, data, done) {
    var parsesActive = 0;
    var this_ = this;

    function parseChild(input, level) {

      function childData(option) {
        var ownResult = option.result[this_.props.id] || [];
        var childResult = option.result[this_.props.child.props.id];
        var newOption;
        var continueToSeparator;

        //if the repeat is unique and the childResult already exists in the result,
        // just stop - we will not do this branch
        if (this_.props.unique && ownResult.indexOf(childResult) !== -1) {
          return;
        }

        if (typeof childResult !== 'undefined') {
          ownResult.push(childResult);
        }

        //set this repeat's result to the new ownResult
        newOption = option.handleValue(this_.props.id, ownResult);

        //clear out the child's result
        newOption = newOption.handleValue(this_.props.child.props.id, undefined);

        //store continueToSeparator, in case the call to data data changes newOption
        continueToSeparator = newOption.suggestion.length === 0;

        //only call data if we are within the min/max repeat range
        if (level >= this_.props.min && level <= this_.props.max) {
          data(newOption);
        }

        //
        if (level < this_.props.max && continueToSeparator) {
          parseSeparator(newOption, level);
        }
      }

      function childDone(err) {
        if (err) {
          done(err);
        } else {
          parsesActive--;
          if (parsesActive === 0) {
            done();
          }
        }
      }

      var newOptions = _.clone(options);
      newOptions.input = input;

      parsesActive++;
      this_.props.child.parse(newOptions, childData, childDone);
    }

    function parseSeparator(input, level) {

      function separatorData(option) {
        parseChild(option, level + 1);
      }

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

      var newOptions;

      if (this_.props.separator) {
        newOptions = _.clone(options);
        newOptions.input = input;

        this_.props.separator.parse(newOptions, separatorData, separatorDone);
      } else {
        separatorData(input);
        separatorDone();
      }
    }

    parseChild(options.input, 1);
  }
});
