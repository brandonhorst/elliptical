var createPhrase = require('../create-phrase');

var _ = require('lodash');

var sequence;

function addSeparator(child, separator) {
  var newChild, newProps;

  if (child.props.optional) {
    newProps = _.clone(child.props);
    newProps.optional = false;

    newChild = child._constructor(newProps);

    return sequence({
      optional: 'true',
      children: [newChild, separator]
    });

  } else {

    return sequence({
      children: [child, separator]
    });
  }
}

sequence = createPhrase({
  name: 'sequence',
  //take the props, and set the actualChildren property
  onCreate: function () {
    var this_ = this;

    if (this.props.separator) {
      this.actualChildren = this.props.children.slice(0, -1)
        .map(function (child) {
          return addSeparator(child, this_.props.separator);
        }).concat(this.props.children[this.props.children.length - 1]);

    } else {
      this.actualChildren = this.props.children;
    }
  },
  _handleParse: function (options, data, done) {
    var parsesActive = 0;
    var this_ = this;

    function parseChild(childIndex, input) {
      function childData(option) {
        var newResult;
        if (childIndex === this_.actualChildren.length - 1) {
          newResult = option.handleValue(this_.props.id, this_.props.value);
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

      var newOptions = _.clone(options);

      newOptions.input = input;

      parsesActive++;
      this_.actualChildren[childIndex].parse(newOptions, childData, childDone);
    }

    parseChild(0, options.input);
  }
});

module.exports = sequence;
