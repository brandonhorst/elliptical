var _ = require('lodash');
var asyncEach = require('async-each');

var createPhrase = require('../create-phrase');

//Choice::handleParse
module.exports = createPhrase({
  name: 'choice',
  getDefaultProps: function () {
    return {limit: 0};
  },
  handleUnlimited: function(options, data, done) {
    var this_ = this;
    //function eachChild
    // parse the child and call data if it calls its data
    function eachChild(child, done) {

      //function childData
      // set this Choice's value to the value of the child, then call data
      function childData(option) {
        var newResult;
        newResult = option.handleValue(this_.props.id, option.result[child.props.id]);
        data(newResult);
      }

      //parse the child
      var newOptions = _.clone(options);
      newOptions.input = options.applyLimit(options.input);
      child.parse(newOptions, childData, done);
    }

    //Parse each child asyncronously
    asyncEach(this.props.children, eachChild, done);

  },
  _handleParse: function (options, data, done) {
    this.handleUnlimited(options, data, done);
  }
});
