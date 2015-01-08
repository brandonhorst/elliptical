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

  it('suggests properly when fuzzy matching is enabled', function (done) {
    var grammar = {
      phrases: [{
        name: 'test',
        root: 'a simple test'
      }]
    };

    function callback(data) {
      expect(data).to.have.length(3);
      expect(data[1].data.suggestion.charactersComplete).to.equal(0);
      expect(data[1].data.suggestion.words[0].string).to.equal('a simple test');
      done();
    }

    parser.understand(grammar);
    testUtil.toStream([''])
    .pipe(parser)
    .pipe(testUtil.toArray(callback));
  });

  it('can do fuzzy matching with regex special characters', function (done) {
    var grammar = {
      phrases: [{
        name: 'test',
        root: '[whatever]'
      }]
    };

    function callback(data) {
      expect(data).to.have.length(3);
      expect(data[1].data.suggestion.charactersComplete).to.equal(10);
      expect(data[1].data.suggestion.words[0].string).to.equal('[whatever]');
      done();
    }

    parser.understand(grammar);
    testUtil.toStream(['[]'])
    .pipe(parser)
    .pipe(testUtil.toArray(callback));
  });

  it('supports sequence when fuzzy is enabled', function (done) {
    var grammar = {
      phrases: [{
        name: 'test',
        root: ['abc', 'def']
      }]
    };

    function callback(data) {
      expect(data).to.have.length(3);
      expect(data[1].data.suggestion.charactersComplete).to.equal(4);
      expect(data[1].data.suggestion.words[0].string).to.equal('abc');
      expect(data[1].data.suggestion.words[1].string).to.equal('def');
      done();
    }

    parser.understand(grammar);
    testUtil.toStream(['ad'])
    .pipe(parser)
    .pipe(testUtil.toArray(callback));
  });

  it('sequence can skip entire values', function (done) {
    var grammar = {
      phrases: [{
        name: 'test',
        root: ['abc', 'def', 'ghi', 'jkl']
      }]
    };

    function callback(data) {
      expect(data).to.have.length(3);
      expect(data[1].data.suggestion.charactersComplete).to.equal(12);
      expect(data[1].data.suggestion.words).to.have.length(4);
      expect(data[1].data.suggestion.words[0].string).to.equal('abc');
      expect(data[1].data.suggestion.words[1].string).to.equal('def');
      expect(data[1].data.suggestion.words[2].string).to.equal('ghi');
      expect(data[1].data.suggestion.words[3].string).to.equal('jkl');
      expect(data[1].data.match).to.be.empty;
      done();
    }

    parser.understand(grammar);
    testUtil.toStream(['agjkl'])
    .pipe(parser)
    .pipe(testUtil.toArray(callback));
  });
});
