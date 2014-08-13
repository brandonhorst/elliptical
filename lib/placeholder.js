var _ = require('lodash');
var async = require('async');
var Element = require('./element');
var util = require('util');

var Placeholder = function(options, scope, phraseAccessor) {
  'use strict';
  var this_ = this;

  Placeholder.super_.call(this, options);

  this.phraseAccessor = phraseAccessor;
  this.type = options.type;
  this.options = _.omit(options, 'type');
  this.options.$call = function(func) {
    var args = 2 <= arguments.length ? Array.prototype.slice.call(arguments, 1) : [];

    return scope[func].apply(this_.options, args);
  };
};

util.inherits(Placeholder, Element);

Placeholder.prototype.handleParse = function(input, lang, context, data, done) {
  'use strict';
  var this_ = this;
  var oldResult = _.cloneDeep(input.result);
  var phrases = this.phraseAccessor(this.type);

  var eachPhrase = function(phrase, done) {

    var phraseData = function(option) {
      var handleValue = function(err, value) {
        var newOption;
        newOption = option.replaceResult(oldResult);
        newOption = newOption.handleValue(this_.id, value);
        data(newOption);
        currentlyInData--;
        if (currentlyInData === 0 && doneCalled) {
          done();
        }
      };

      currentlyInData++;

      phrase.getValue(this_.options, option.result, handleValue);
    };

    var phraseDone = function(err) {
      if (err) {
        done(err);
      } else if (currentlyInData === 0) {
        done();
      } else {
        doneCalled = true;
      }
    };

    var currentlyInData = 0;
    var doneCalled = false;

    phrase.parse(input, lang, this_.options, phraseData, phraseDone);
  };

  async.each(phrases, eachPhrase, done);
};

module.exports = Placeholder;
