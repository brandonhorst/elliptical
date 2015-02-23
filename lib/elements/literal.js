"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var createPhrase = _interopRequire(require("../create-phrase"));

var value = _interopRequire(require("./value"));

module.exports = createPhrase({
  name: "literal",
  computeLiteral: function computeLiteral(inputString, data, done) {
    data({
      text: this.props.text,
      value: this.props.value
    });
    return done();
  },
  getValue: function getValue(result) {
    return result.literal;
  },
  describe: function describe() {
    return value({
      id: "literal",
      compute: this.computeLiteral,
      category: this.props.category,
      join: this.props.join
    });
  }
});