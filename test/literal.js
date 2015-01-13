var chai = require('chai');
var expect = chai.expect;
var u = require('./util');

describe('literal', function() {
  var parser;

  beforeEach(function() {
    parser = new u.lacona.Parser();
  });

  it('handles an implicit literal (string in schema)', function (done) {
    var test = u.lacona.createPhrase({
      name: 'test/test',
      describe: function () {
        return u.lacona.literal({display: 'literal test'});
      }
    });

    function callback(data) {
      expect(data).to.have.length(3);
      expect(data[1].data.suggestion.words).to.have.length(1);
      expect(data[1].data.suggestion.charactersComplete).to.equal(1);
      expect(data[1].data.suggestion.words[0].string).to.equal('literal test');
      expect(data[1].data.result).to.be.empty;
      done();
    }

    parser.sentences = [test()];
    u.toStream(['l'])
      .pipe(parser)
      .pipe(u.toArray(callback));
  });

  it('handles a literal with an id', function (done) {
    var test = u.lacona.createPhrase({
      name: 'test/test',
      describe: function () {
        return u.lacona.literal({
          display: 'literal test',
          value: 'test',
          id: 'testId'
        });
      }
    });

    function callback(data) {
      expect(data).to.have.length(3);
      expect(data[1].data.suggestion.words).to.have.length(1);
      expect(data[1].data.suggestion.charactersComplete).to.equal(1);
      expect(data[1].data.suggestion.words[0].string).to.equal('literal test');
      expect(data[1].data.result).to.deep.equal({testId: 'test'});
      done();
    }

    parser.sentences = [test()];
    u.toStream(['l'])
      .pipe(parser)
      .pipe(u.toArray(callback));
  });
});
