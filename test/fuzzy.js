var chai = require('chai');
var expect = chai.expect;
var testUtil = require('./util');

describe('Parser with fuzzy matching', function () {
  var parser;
  beforeEach(function() {
    parser = new testUtil.lacona.Parser({fuzzy: true, sentences: ['test']});
  });

  it('supports fuzzy matching', function (done) {
    var grammar = {
      phrases: [{
        name: 'test',
        root: 'a simple test'
      }]
    };

    function callback(data) {
      expect(data).to.have.length(1);
      expect(data[0].suggestion.charactersComplete).to.equal(10);
      expect(data[0].suggestion.words[0].string).to.equal('a simple test');
      done();
    }

    parser.understand(grammar);
    testUtil.toStream(['asmlt'])
      .pipe(parser)
      .pipe(testUtil.toArray(callback));
  });
});
