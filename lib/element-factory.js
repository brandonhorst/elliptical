(function() {
  var Choice, ElementFactory, Phrase, Placeholder, Repeat, Sequence, Value, _;

  _ = require('lodash');

  Choice = require('./choice');

  Sequence = require('./sequence');

  Repeat = require('./repeat');

  Phrase = require('./phrase');

  Value = require('./value');

  Placeholder = require('./placeholder');

  ElementFactory = (function() {
    function ElementFactory(scope, lacona) {
      this.scope = scope;
      this.lacona = lacona;
    }

    ElementFactory.prototype.create = function(object) {
      var element, trueObject;
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
        case 'queue':
          element = new Queue(trueObject, this);
          break;
        default:
          element = new Placeholder(trueObject, this.scope, this.lacona._phraseAccessor);
      }
      return element;
    };

    return ElementFactory;

  })();

  module.exports = ElementFactory;

}).call(this);
