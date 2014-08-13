var Group = require('./group');

var async = require('async');
var util = require('util');

//class Choice extends Group
function Choice(options, factory) {
  'use strict';
  var child;
  var i;
  var childrenLength;

  //call super constructor
  Choice.super_.call(this, options);

  //create this.children array (elements) from options.children (raw objects)
  this.children = [];
  childrenLength = options.children.length;
  for (i = 0; i < childrenLength; i++){
    child = options.children[i];
    this.children.push(factory.create(child));
  }

  //set this.limit, default to 0 if options.limit is not supplied
  if (typeof options.limit !== 'undefined') {
    this.limit = options.limit;
  } else {
    this.limit = 0;
  }
}

//Choice inherits Group
util.inherits(Choice, Group);

//Choice::handleParse
Choice.prototype.handleParse = function handleParse(input, lang, context, data, done) {
  'use strict';
  var this_ = this;

  var eachChild;
  var childrenDone;
  var childHits = {};

  //If there is no limit, parse them all asyncronously
  if (this.limit === 0) {

    //function eachChild
    // parse the child and call data if it calls its data
    eachChild = function eachChild(child, done) {

      //function childData
      // set this Choice's value to the value of the child, then call data
      var childData = function(option) {
        var newResult;
        newResult = option.handleValue(this_.id, option.result[child.id]);
        data(newResult);
      };

      //parse the child
      child.parse(input, lang, context, childData, done);
    };

    //Parse each child asyncronously
    async.each(this.children, eachChild, done);

  //If there is a limit, parse them syncronously
  } else {

    //function eachChild
    // parse the child and call data if it calls data
    // track hitCount so that childDone can stop it at the limit
    eachChild = function(child, done) {


      //function childData
      // set this Choice's value to the value of the child, then call data
      // note that this child has had a hit, so increment the hitcount
      var childData = function(option) {
        var newResult;

        childHits[child.id] = true;
        newResult = option.handleValue(this_.id, option.result[child.id]);
        data(newResult);
      };

      //function childDone
      // if hitCount has hit the limit, then pass a true to to the done() cb.
      //  this will make async.eachSeries stop executing, but childrenDone
      //  will notice that it is not actually an error and behave accordingly
      var childDone = function(err) {
        if (err) {
          done(err);
        } else {
          done(Object.keys(childHits).length >= this_.limit ? true : null);
        }
      };

      //parse the child, calling childData on data and childDone on done
      child.parse(input, lang, context, childData, childDone);
    };

    //function childrenDone
    // if err is defined, it could be either an actual error, or just a true
    //  passed from childDone. If it is an error, pass it on. Otherwise,
    //  it was just a termination indicator - call done without an error.
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
