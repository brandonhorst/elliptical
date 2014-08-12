(function() {
  var Choice, Group, async, util,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  async = require('async');

  util = require('util');

  Group = require('./group');

  Choice = (function(_super) {
    __extends(Choice, _super);

    function Choice(options, factory) {
      var child;
      Choice.__super__.constructor.call(this, options);
      this.children = (function() {
        var _i, _len, _ref, _results;
        _ref = options.children;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          child = _ref[_i];
          _results.push(factory.create(child));
        }
        return _results;
      })();
      if (options.limit != null) {
        this.limit = options.limit;
      } else {
        this.limit = 0;
      }
    }

    Choice.prototype.handleParse = function(input, lang, context, data, done) {
      var hitCount;
      if (this.limit === 0) {
        return async.each(this.children, (function(_this) {
          return function(child, done) {
            return child.parse(input, lang, context, function(option) {
              var newResult;
              newResult = option.handleValue(_this.id, option.result[child.id]);
              return data(newResult);
            }, done);
          };
        })(this), done);
      } else {
        hitCount = 0;
        return async.eachSeries(this.children, (function(_this) {
          return function(child, done) {
            var hasData;
            hasData = false;
            return child.parse(input, lang, context, function(option) {
              var newResult;
              hitCount += 1;
              newResult = option.handleValue(_this.id, option.result[child.id]);
              return data(newResult);
            }, function(err) {
              if (err != null) {
                return done(err);
              } else {
                return done(hitCount >= _this.limit ? true : null);
              }
            });
          };
        })(this), (function(_this) {
          return function(err) {
            if ((err != null) && util.isError(err)) {
              return done(err);
            } else {
              return done();
            }
          };
        })(this));
      }
    };

    return Choice;

  })(Group);

  module.exports = Choice;

}).call(this);
