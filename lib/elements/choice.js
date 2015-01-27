var asyncEach = require('async-each');

var createPhrase = require('../create-phrase');
var InputOption = require('../input-option');

//Choice::handleParse
module.exports = createPhrase({
  name: 'choice',
  _handleParse: function(input, options, applyLimit, data, done) {
    var this_ = this;
    //function eachChild
    // parse the child and call data if it calls its data
    function eachChild(child, done) {

      //function childData
      // set this Choice's value to the value of the child, then call data
      function childData(input) {
        var inputData = input.getData();
        inputData.result[this_.props.id] = input.result[child.props.id];
        data(new InputOption(inputData));
      }

      //parse the child
      var newInput = input;
      var inputData;
      if (this_.props.limit) {
        inputData = input.getData();
        inputData.limit = applyLimit(input);
        newInput = new InputOption(inputData);
      }
      child.parse(newInput, options, childData, done);
    }

    //Parse each child asyncronously
    asyncEach(this.props.children, eachChild, done);
  }
});
