var Group = require('./group');

var util = require('util');

//class Repeat extends Group
var Repeat = function(options, factory) {
  Repeat.super_.call(this, options);

  this.child = factory(options.child);

  //separator defaults to ' '
  this.separator = factory(options.separator || ' ');

  //options.max defaults to huge, but can be 0, so no ||
  this.max = options.max || Number.MAX_VALUE;

  //min defaults to 0
  this.min = options.min || 0;

  //unique defaults to false
  this.unique = options.unique || false;
};

util.inherits(Repeat, Group);

Repeat.prototype.handleParse = function(input, lang, context, data, done) {
  var parsesActive = 0;
  var this_ = this;

  var parseChild = function(input, wasSuggested, level) {

    var childData = function(option) {
      var ownResult = option.result[this_.id] || [];
      var childResult = option.result[this_.child.id];
      var newOption;
      var continueToSeparator;

      //if the repeat is unique and the childResult already exists in the result,
      // just stop - we will not do this branch
      if (this_.unique && ownResult.indexOf(childResult) !== -1) {
        return;
      }

      if (typeof childResult !== 'undefined') {
        ownResult.push(childResult);
      }

      //set this repeat's result to the new ownResult
      newOption = option.handleValue(this_.id, ownResult);

      //clear out the child's result
      newOption = newOption.handleValue(this_.child.id, undefined);

      //store continueToSeparator, in case the call to data data changes newOption
      continueToSeparator = newOption.suggestion.words.length === 0;

      //only call data if we are within the min/max repeat range
      if (level >= this_.min && level <= this_.max) {
        data(newOption);
      }

      //
      if (level < this_.max && continueToSeparator) {
        parseSeparator(newOption, wasSuggested, level);
      }
    };

    var childDone = function(err) {
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
    this_.child.parse(input, lang, context, childData, childDone);
  };

  var parseSeparator = function(input, wasSuggested, level) {

    var separatorData = function(option) {
      parseChild(option, wasSuggested, level + 1);
    };

    var separatorDone = function(err) {
      if (err) {
        done(err);
      } else {
        parsesActive--;
        if (parsesActive === 0) {
          done();
        }
      }
    };

    this_.separator.parse(input, lang, context, separatorData, separatorDone);
  };

  parseChild(input, false, 1);
};

module.exports = Repeat;
