(function() {
  var Group, Repeat, _,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  _ = require('lodash');

  Group = require('./group');

  Repeat = (function(_super) {
    __extends(Repeat, _super);

    function Repeat(options, factory) {
      var _ref, _ref1, _ref2, _ref3;
      Repeat.__super__.constructor.call(this, options);
      this.child = factory.create(options.child);
      this.separator = factory.create((_ref = options.separator) != null ? _ref : ' ');
      this.max = (_ref1 = options.max) != null ? _ref1 : Number.MAX_VALUE;
      this.min = (_ref2 = options.min) != null ? _ref2 : Number.MIN_VALUE;
      this.unique = (_ref3 = options.unique) != null ? _ref3 : false;
    }

    Repeat.prototype.handleParse = function(input, lang, context, data, done) {
      var parseChild, parseSeparator, parsesActive;
      parsesActive = 0;
      parseChild = (function(_this) {
        return function(input, wasSuggested, level) {
          parsesActive++;
          return _this.child.parse(input, lang, context, function(option) {
            var childResult, continueToSeparator, newOption, ownResult;
            ownResult = _.isArray(option.result[_this.id]) ? option.result[_this.id] : [];
            childResult = option.result[_this.child.id];
            if (_this.unique && __indexOf.call(ownResult, childResult) >= 0) {
              return;
            }
            if (typeof childResult !== 'undefined') {
              ownResult.push(childResult);
            }
            newOption = option.handleValue(_this.id, ownResult);
            newOption = newOption.handleValue(_this.child.id, void 0);
            continueToSeparator = newOption.suggestion.words.length === 0;
            if (level >= _this.min && level <= _this.max) {
              data(newOption);
            }
            if (level < _this.max && continueToSeparator) {
              return parseSeparator(newOption, wasSuggested, level);
            }
          }, function(err) {
            if (err != null) {
              return done(err);
            } else {
              parsesActive--;
              if (parsesActive === 0) {
                return done();
              }
            }
          });
        };
      })(this);
      parseSeparator = (function(_this) {
        return function(input, wasSuggested, level) {
          parsesActive++;
          return _this.separator.parse(input, lang, context, function(option) {
            return parseChild(option, wasSuggested, level + 1);
          }, function(err) {
            if (err != null) {
              return done(err);
            } else {
              parsesActive--;
              if (parsesActive === 0) {
                return done();
              }
            }
          });
        };
      })(this);
      return parseChild(input, false, 1);
    };

    return Repeat;

  })(Group);

  module.exports = Repeat;

}).call(this);
