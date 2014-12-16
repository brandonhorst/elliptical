var Choice = require('./choice');
var Sequence = require('./sequence');
var Repeat = require('./repeat');
var Value = require('./value');
var Placeholder = require('./placeholder');

//factory elementFactory
function grammarElementFactory(grammar) {
  function elementFactory(object) {
    var element;
    var trueObject;

    if (typeof object === 'string') {
      trueObject = {
        type: 'literal',
        display: object,
        value: object,
        category: '@category'
      };
    } else if (Array.isArray(object)) {
      trueObject = {
        type: 'sequence',
        children: object,
        category: '@category'
      };
    } else {
      trueObject = object;
    }

    switch (trueObject.type) {
      case 'value':
        element = new Value(trueObject, grammar.scope);
        break;
      case 'choice':
        element = new Choice(trueObject, elementFactory);
        break;
      case 'sequence':
        element = new Sequence(trueObject, elementFactory);
        break;
      case 'repeat':
        element = new Repeat(trueObject, elementFactory);
        break;
      default:
        element = new Placeholder(trueObject, grammar);
    }
    return element;
  }
  return elementFactory;
}

module.exports = grammarElementFactory;
