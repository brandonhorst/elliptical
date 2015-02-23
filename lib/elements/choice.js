"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var asyncEach = _interopRequire(require("async-each"));

var createPhrase = _interopRequire(require("../create-phrase"));

var InputOption = _interopRequire(require("../input-option"));

module.exports = createPhrase({
  name: "choice",
  _handleParse: function _handleParse(input, options, applyLimit, data, done) {
    var _this = this;

    var eachChild = function (child, done) {
      var childData = function (input) {
        var inputData = input.getData();
        inputData.result[_this.props.id] = input.result[child.props.id];
        data(new InputOption(inputData));
      };

      // parse the child
      var newInput = input;
      var inputData;
      if (_this.props.limit) {
        inputData = input.getData();
        inputData.limit = applyLimit(input);
        newInput = new InputOption(inputData);
      }
      child.parse(newInput, options, childData, done);
    };

    // Parse each child asyncronously
    asyncEach(this.props.children, eachChild, done);
  }
});