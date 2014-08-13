var _ = require('lodash');
var Choice = require('./choice');
var Sequence = require('./sequence');
var Repeat = require('./repeat');
var Value = require('./value');
var Placeholder = require('./placeholder');

var ElementFactory = function(scope, lacona) {
  'use strict';
  this.scope = scope;
  this.lacona = lacona;
};

ElementFactory.prototype.create = function(object) {
  'use strict';
  var element;
  var trueObject;

  if (_.isString(object)) {
    trueObject = {
      type: 'literal',
      display: object,
      value: object
    };
  } else if (_.isArray(object)) {
    trueObject = {
      type: 'sequence',
      children: object
    };
  } else {
    trueObject = object;
  }

  switch (trueObject.type) {
    case 'value':
      element = new Value(trueObject, this.scope);
      break;
    case 'choice':
      element = new Choice(trueObject, this);
      break;
    case 'sequence':
      element = new Sequence(trueObject, this);
      break;
    case 'repeat':
      element = new Repeat(trueObject, this);
      break;
    default:
      element = new Placeholder(trueObject, this.scope, this.lacona._phraseAccessor);
  }
  return element;
};

module.exports = ElementFactory;
