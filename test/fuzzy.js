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
      expect(data).to.have.length(3);
      expect(data[1].data.suggestion.charactersComplete).to.equal(10);
      expect(data[1].data.suggestion.words[0].string).to.equal('a simple test');
      done();
    }

    parser.understand(grammar);
    testUtil.toStream(['asmlt'])
    .pipe(parser)
    .pipe(testUtil.toArray(callback));
  });

  it('rejects misses properly with fuzzy matching', function (done) {
    var grammar = {
      phrases: [{
        name: 'test',
        root: 'a simple test'
      }]
    };

    function callback(data) {
      expect(data).to.have.length(2);
      done();
    }

    parser.understand(grammar);
    testUtil.toStream(['fff'])
    .pipe(parser)
    .pipe(testUtil.toArray(callback));
  });
});
