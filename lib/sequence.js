(function() {
  var Group, Sequence, _,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  _ = require('lodash');

  Group = require('./group');

  Sequence = (function(_super) {
    __extends(Sequence, _super);

    function Sequence(options, factory) {
      var child, _i, _len, _ref, _ref1;
      Sequence.__super__.constructor.call(this, options);
      this.value = options.value;
      this.children = [];
      _ref = options.children;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        child = _ref[_i];
        this.children.push(factory.create(child));
        if (options.separator !== null) {
          this.children.push(factory.create((_ref1 = options.separator) != null ? _ref1 : ' '));
        }
      }
      if (options.separator !== null) {
        this.children.pop();
      }
    }

    Sequence.prototype.handleParse = function(input, lang, context, data, done) {
      var parseChild, parsesActive;
      parsesActive = 0;
      parseChild = (function(_this) {
        return function(childIndex, input) {
          parsesActive++;
          return _this.children[childIndex].parse(input, lang, context, function(option) {
            var newResult;
            if (childIndex === _this.children.length - 1) {
              newResult = option.handleValue(_this.id, _this.value);
              return data(newResult);
            } else {
              return parseChild(childIndex + 1, option);
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
      return parseChild(0, input);
    };

    return Sequence;

  })(Group);

  module.exports = Sequence;

}).call(this);
