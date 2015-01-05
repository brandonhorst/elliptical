var chai = require('chai');
var expect = chai.expect;
var testUtil = require('./util');

describe('literal', function() {
  var parser;

  beforeEach(function() {
    parser = new testUtil.lacona.Parser({sentences: ['test']});
  });

  it('handles an implicit literal (string in schema)', function (done) {
    var grammar = {
      phrases: [{
        name: 'test',
        root: 'literal test'
      }]
    };

    function callback(data) {
      expect(data).to.have.length(3);
      expect(data[1].data.suggestion.words).to.have.length(1);
      expect(data[1].data.suggestion.charactersComplete).to.equal(1);
      expect(data[1].data.suggestion.words[0].string).to.equal('literal test');
      expect(data[1].data.result).to.be.empty;
      done();
    }

    parser.understand(grammar);
    testUtil.toStream(['l'])
      .pipe(parser)
      .pipe(testUtil.toArray(callback));
  });

  it('handles a fully-qualified literal (no id)', function (done) {
    var grammar = {
      phrases: [{
        name: 'test',
        root: {
          type: 'literal',
          display: 'literal test'
        }
      }]
    };

    function callback(data) {
      expect(data).to.have.length(3);
      expect(data[1].data.suggestion.words).to.have.length(1);
      expect(data[1].data.suggestion.charactersComplete).to.equal(1);
      expect(data[1].data.suggestion.words[0].string).to.equal('literal test');
      expect(data[1].data.result).to.be.empty;
      done();
    }

    parser.understand(grammar);
    testUtil.toStream(['l'])
      .pipe(parser)
      .pipe(testUtil.toArray(callback));
  });

  it('handles a fully-qualified literal with an id', function (done) {
    var grammar = {
      phrases: [{
        name: 'test',
        root: {
          type: 'literal',
          display: 'literal test',
          value: 'test',
          id: 'testId'
        }
      }]
    };

    function callback(data) {
      expect(data).to.have.length(3);
      expect(data[1].data.suggestion.words).to.have.length(1);
      expect(data[1].data.suggestion.charactersComplete).to.equal(1);
      expect(data[1].data.suggestion.words[0].string).to.equal('literal test');
      expect(data[1].data.result).to.deep.equal({testId: 'test'});
      done();
    }

    parser.understand(grammar);
    testUtil.toStream(['l'])
      .pipe(parser)
      .pipe(testUtil.toArray(callback));
  });
});
