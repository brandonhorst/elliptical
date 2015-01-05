var chai = require('chai');
var expect = chai.expect;
var testUtil = require('./util');

describe('dependencies', function () {
  var parser;
  beforeEach(function() {
    parser = new testUtil.lacona.Parser({sentences: ['test']});
  });

  it('handles basic dependencies', function (done) {
    var grammar = {
      phrases: [{
        name: 'test',
        root: {type: 'dep'}
      }],
      dependencies: [{
        phrases: [{
          name: 'dep',
          root: 'something'
        }]
      }]
    };

    function callback(data) {
      expect(data).to.have.length(3);
      expect(data[1].data.suggestion.words[0].string).to.equal('something');
      done();
    }

    parser.understand(grammar);
    testUtil.toStream(['s'])
      .pipe(parser)
      .pipe(testUtil.toArray(callback));
  });

});
