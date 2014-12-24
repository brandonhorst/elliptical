var Element = require('./element');
var util = require('./util');

var inherits = require('inherits');

function addSeparator(child, separator) {
  var newChild, newChildSequence;

  if (child.optional) {
    newChild = util.clone(child);
    newChild.optional = false;

    newChildSequence = {
      type: 'sequence',
      optional: true,
      children: [
        newChild,
        separator
      ]
    };
  } else {
    newChildSequence = {
      type: 'sequence',
      children: [
        child,
        separator
      ]
    };
  }

  return newChildSequence;
}

var Sequence = function Sequence(options, factory) {
  Sequence.super_.call(this, options);

  this.value = options.value;

  this.children = [];
  if (options.separator) {

    this.children = options.children.slice(0, -1).map(function (child) {
      return addSeparator(child, options.separator);
    }).map(factory);
    this.children.push(factory(options.children[options.children.length - 1]));

  } else {
    this.children = options.children.map(factory);
  }
};

inherits(Sequence, Element);

Sequence.prototype.handleParse = function(options, data, done) {
  var parsesActive = 0;
  var this_ = this;

  function parseChild(childIndex, input) {
    function childData(option) {
      var newResult;
      if (childIndex === this_.children.length - 1) {
        newResult = option.handleValue(this_.id, this_.value);
        data(newResult);
      } else {
        parseChild(childIndex + 1, option);
      }
    }

    function childDone(err) {
      if (err) {
        done(err);
      } else {
        parsesActive--;
        if (parsesActive === 0) {
          done();
        }
      }
    }

    var newOptions = util.clone(options);

    newOptions.input = input;

    parsesActive++;
    this_.children[childIndex].parse(newOptions, childData, childDone);
  }

  parseChild(0, options.input);
};

module.exports = Sequence;
