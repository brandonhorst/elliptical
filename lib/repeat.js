var Group = require('./group');

var _ = require('lodash');
var util = require('util');

var Repeat = function(options, factory) {
  'use strict';
  Repeat.super_.call(this, options);

  //separator defaults to ' '
  if (typeof options.separator === 'undefined') {
    options.separator = ' ';
  }
  if (typeof options.max === 'undefined') {
    options.max = Number.MAX_VALUE;
  }
  if (typeof options.min === 'undefined') {
    options.min = Number.MIN_VALUE;
  }
  if (typeof options.min === 'undefined') {
    options.min = Number.MIN_VALUE;
  }
  if (typeof options.unique === 'undefined') {
    options.unique = false;
  }

  this.child = factory.create(options.child);
  this.separator = factory.create(options.separator);
  this.max = options.max;
  this.min = options.min;
  this.unique = options.unique;
};

util.inherits(Repeat, Group);

Repeat.prototype.handleParse = function(input, lang, context, data, done) {
  'use strict';
  var parsesActive = 0;
  var this_ = this;

  var parseChild = function(input, wasSuggested, level) {
    
    var childData = function(option) {
      var ownResult = _.isArray(option.result[this_.id]) ? option.result[this_.id] : [];
      var childResult = option.result[this_.child.id];
      var newOption;
      var continueToSeparator;

      if (this_.unique && _.contains(ownResult, childResult)) {
        return;
      }

      if (typeof childResult !== 'undefined') {
        ownResult.push(childResult);
      }

      newOption = option.handleValue(this_.id, ownResult);

      newOption = newOption.handleValue(this_.child.id, undefined);

      //store continueToSeparator, in case the call to data data changes newOption
      continueToSeparator = newOption.suggestion.words.length === 0;

      if (level >= this_.min && level <= this_.max) {
        data(newOption);
      }

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