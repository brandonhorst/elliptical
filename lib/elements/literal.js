var createPhrase = require('../create-phrase');
var value = require('./value');

module.exports = createPhrase({
  name: 'literal',
  computeLiteral: function (inputString, data, done) {
    data({
      display: this.props.display,
      value: this.props.value
    });
    return done();
  },
  getValue: function (result) {
    return result.literal;
  },
  describe: function () {
    return value({
      id: 'literal',
      compute: this.computeLiteral,
      category: this.props.category
    });
  }
});
