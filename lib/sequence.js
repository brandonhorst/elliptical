var Group = require('./group');

var util = require('util');

var Sequence = function Sequence(options, factory) {
  'use strict';
  var child;
  var i;
  var l = options.children.length;

  Sequence.super_.call(this, options);

  //Default value for options.separator
  if (typeof options.separator === 'undefined') {
    options.separator = ' ';
  }

  this.value = options.value;

  this.children = [];
  for (i = 0; i < l; i++) {
    child = options.children[i];
    this.children.push(factory.create(child));
    if (options.separator !== null) {
      this.children.push(factory.create(options.separator));
    }
  }
};

util.inherits(Sequence, Group);

Sequence.prototype.handleParse = function(input, lang, context, data, done) {
  'use strict';
  var parsesActive = 0;
  var this_ = this;

  var parseChild = function(childIndex, input) {

    var childData = function(option) {
      var newResult;
      if (childIndex === this_.children.length - 1) {
        newResult = option.handleValue(this_.id, this_.value);
        data(newResult);
      } else {
        parseChild(childIndex + 1, option);
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
    this_.children[childIndex].parse(input, lang, context, childData, childDone);
  };

  parseChild(0, input);
};

module.exports = Sequence;
