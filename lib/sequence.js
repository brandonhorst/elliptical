var Category = require('./category');
var Element = require('./element');
var util = require('./util');

var inherits = require('inherits');

var Sequence = function Sequence(options, factory) {
  var child;
  var i;
  var l = options.children.length;

  Sequence.super_.call(this, options);

  //Default value for options.separator
  if (typeof options.separator === 'undefined') {
    options.separator = {
      type: 'literal',
      category: Category.punctuation,
      display: ' '
    };
  }

  this.value = options.value;

  this.children = [];
  for (i = 0; i < l; i++) {
    child = options.children[i];
    this.children.push(factory(child));
    if (options.separator !== null && i !== l - 1) {
      this.children.push(factory(options.separator));
    }
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
