var Group = require('./group');

var async = require('async');
var util = require('util');

var Choice = function(options, factory) {
  'use strict';
  var child;
  var i;
  var l = options.children.length;

  //call super constructor
  Choice.super_.call(this, options);

  //create children array
  this.children = [];
  for (i = 0; i < l; i++){
    child = options.children[i];
    this.children.push(factory.create(child));
  }

  //set limit option, default to 0
  if (typeof options.limit !== 'undefined') {
    this.limit = options.limit;
  } else {
    this.limit = 0;
  }
};

util.inherits(Choice, Group);

Choice.prototype.handleParse = function(input, lang, context, data, done) {
  'use strict';
  var hitCount;
  var this_ = this;
  var eachChild;
  var childrenDone;

  //If there is no limit, parse them all asyncronously
  if (this.limit === 0) {
    eachChild = function(child, done) {
      var childData = function(option) {
        var newResult;
        newResult = option.handleValue(this_.id, option.result[child.id]);
        data(newResult);
      };

      child.parse(input, lang, context, childData, done);
    };


    async.each(this.children, eachChild, done);

  //If there is a limit
  } else {
    hitCount = 0;

    eachChild = function(child, done) {
      var childData = function(option) {
        var newResult;
        hitCount += 1;
        newResult = option.handleValue(this_.id, option.result[child.id]);
        data(newResult);
      };

      var childDone = function(err) {
        if (err) {
          done(err);
        } else {
          done(hitCount >= this_.limit ? true : null);
        }
      };

      child.parse(input, lang, context, childData, childDone);
    };


    childrenDone = function(err) {
      if (err && util.isError(err)) {
        return done(err);
      } else {
        return done();
      }
    };

    async.eachSeries(this.children, eachChild, childrenDone);
  }
};

module.exports = Choice;
