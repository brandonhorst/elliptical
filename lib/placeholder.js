(function() {
  var Element, InputOption, Placeholder, async, _,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    __slice = [].slice;

  _ = require('lodash');

  async = require('async');

  Element = require('./element');

  InputOption = require('./input-option');

  Placeholder = (function(_super) {
    __extends(Placeholder, _super);

    function Placeholder(options, scope, phraseAccessor) {
      this.phraseAccessor = phraseAccessor;
      Placeholder.__super__.constructor.call(this, options);
      this.type = options.type;
      this.options = _.omit(options, 'type');
      this.options.$call = (function(_this) {
        return function() {
          var args, func;
          func = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
          return scope[func].apply(_this.options, args);
        };
      })(this);
    }

    Placeholder.prototype.handleParse = function(input, lang, context, data, done) {
      var oldResult, phrases;
      oldResult = _.cloneDeep(input.result);
      phrases = this.phraseAccessor(this.type);
      return async.each(phrases, (function(_this) {
        return function(phrase, done) {
          var currentlyInData, doneCalled;
          currentlyInData = 0;
          doneCalled = false;
          return phrase.parse(input, lang, _this.options, function(option) {
            currentlyInData++;
            return phrase.getValue(_this.options, option.result, function(err, value) {
              var newOption;
              newOption = option.replaceResult(oldResult);
              newOption = newOption.handleValue(_this.id, value);
              data(newOption);
              currentlyInData--;
              if (currentlyInData === 0 && doneCalled) {
                return done();
              }
            });
          }, function(err) {
            if (err != null) {
              return done(err);
            } else if (currentlyInData === 0) {
              return done();
            } else {
              return doneCalled = true;
            }
          });
        };
      })(this), done);
    };

    return Placeholder;

  })(Element);

  module.exports = Placeholder;

}).call(this);
