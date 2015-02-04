var chai = require('chai');
var es = require('event-stream');
var expect = chai.expect;
var fulltext = require('lacona-util-fulltext');
var lacona = require('..');

describe('literal', function() {
  var parser;

  beforeEach(function() {
    parser = new lacona.Parser();
  });

  it('handles a literal', function (done) {
    var test = lacona.createPhrase({
      name: 'test/test',
      describe: function () {
        return lacona.literal({text: 'literal test'});
      }
    });

    function callback(err, data) {
      expect(data).to.have.length(3);
      expect(data[1].data.suggestion).to.have.length(2);
      expect(data[1].data.suggestion[0].string).to.equal('l');
      expect(data[1].data.suggestion[0].input).to.be.true;
      expect(data[1].data.suggestion[1].string).to.equal('iteral test');
      expect(data[1].data.suggestion[1].input).to.be.false;
      expect(data[1].data.result).to.be.empty;
      done();
    }

    parser.sentences = [test()];
    es.readArray(['l'])
      .pipe(parser)
      .pipe(es.writeArray(callback));
  });

  it('handles a literal with an id', function (done) {
    var test = lacona.createPhrase({
      name: 'test/test',
      describe: function () {
        return lacona.literal({
          text: 'literal test',
          value: 'test',
          id: 'testId'
        });
      }
    });

    function callback(err, data) {
      expect(data).to.have.length(3);
      expect(fulltext.suggestion(data[1].data)).to.equal('literal test');
      expect(data[1].data.result).to.deep.equal({testId: 'test'});
      done();
    }

    parser.sentences = [test()];
    es.readArray(['l'])
      .pipe(parser)
      .pipe(es.writeArray(callback));
  });

  it('maintains case', function (done) {
    var test = lacona.createPhrase({
      name: 'test/test',
      describe: function () {
        return lacona.literal({text: 'Test'});
      }
    });

    function callback(err, data) {
      expect(data).to.have.length(3);
      expect(fulltext.suggestion(data[1].data)).to.equal('Test');
      done();
    }

    parser.sentences = [test()];
    es.readArray(['t'])
      .pipe(parser)
      .pipe(es.writeArray(callback));
  });
});
