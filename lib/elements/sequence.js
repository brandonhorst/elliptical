"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var createPhrase = _interopRequire(require("../create-phrase"));

var InputOption = _interopRequire(require("../input-option"));

var _ = _interopRequire(require("lodash"));

function addSeparator(child, separator) {
  var newChild, newProps;

  if (child.props.optional) {
    newProps = _.clone(child.props);
    newProps.optional = false;

    newChild = child.factory(newProps);

    return sequence({
      optional: "true",
      children: [newChild, separator]
    });
  } else {
    return sequence({
      children: [child, separator]
    });
  }
}

var sequence = createPhrase({
  name: "sequence",
  // take the props, and set the actualChildren property
  onCreate: function onCreate() {
    var _this = this;

    if (this.props.separator) {
      this.actualChildren = this.props.children.slice(0, -1).map(function (child) {
        return addSeparator(child, _this.props.separator);
      }).concat(this.props.children[this.props.children.length - 1]);
    } else {
      this.actualChildren = this.props.children;
    }
  },
  _handleParse: function _handleParse(input, options, applyLimit, data, done) {
    var _this = this;

    var parsesActive = 0;

    var parseChild = function (childIndex, input) {
      var childData = function (input) {
        var newInputData;
        if (childIndex === _this.actualChildren.length - 1) {
          newInputData = input.getData();
          newInputData.result[_this.props.id] = _this.props.value;
          data(new InputOption(newInputData));
        } else {
          parseChild(childIndex + 1, input);
        }
      };

      var childDone = function (err) {
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
      _this.actualChildren[childIndex].parse(input, options, childData, childDone);
    };

    parseChild(0, input);
  }
});

module.exports = sequence;