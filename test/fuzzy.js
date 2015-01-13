var chai = require('chai');
var expect = chai.expect;
var u = require('./util');

describe('fuzzy matching', function () {
  var parser;
  beforeEach(function () {
    parser = new u.lacona.Parser({fuzzy: true});
  });

  describe('basic usage', function () {
    var test;

    beforeEach(function () {
      test = u.lacona.createPhrase({
        name: 'test/test',
        describe: function () {
          return u.lacona.literal({text: 'a simple test'});
        }
      });
    });

    it('supports fuzzy matching', function (done) {
      function callback(data) {
        expect(data).to.have.length(3);
        expect(data[1].data.suggestion.charactersComplete).to.equal(10);
        expect(data[1].data.suggestion.words[0].string).to.equal('a simple test');
        done();
      }

      parser.sentences = [test()];
      u.toStream(['asmlt'])
      .pipe(parser)
      .pipe(u.toArray(callback));
    });

    it('rejects misses properly with fuzzy matching', function (done) {
      function callback(data) {
        expect(data).to.have.length(2);
        done();
      }

      parser.sentences = [test()];
      u.toStream(['fff'])
      .pipe(parser)
      .pipe(u.toArray(callback));
    });

    it('suggests properly when fuzzy matching is enabled', function (done) {
      function callback(data) {
        expect(data).to.have.length(3);
        expect(data[1].data.suggestion.charactersComplete).to.equal(0);
        expect(data[1].data.suggestion.words[0].string).to.equal('a simple test');
        done();
      }

      parser.sentences = [test()];
      u.toStream([''])
      .pipe(parser)
      .pipe(u.toArray(callback));
    });
  });

  it('can do fuzzy matching with regex special characters', function (done) {
    var test = u.lacona.createPhrase({
      name: 'test/test',
      describe: function () {
        return u.lacona.literal({text: '[whatever]'});
      }
    });

    function callback(data) {
      expect(data).to.have.length(3);
      expect(data[1].data.suggestion.charactersComplete).to.equal(10);
      expect(data[1].data.suggestion.words[0].string).to.equal('[whatever]');
      done();
    }

    parser.sentences = [test()];
    u.toStream(['[]'])
    .pipe(parser)
    .pipe(u.toArray(callback));
  });

  it('supports sequence when fuzzy is enabled', function (done) {
    var test = u.lacona.createPhrase({
      name: 'test/test',
      describe: function () {
        return u.lacona.sequence({children: [
          u.lacona.literal({text: 'abc'}),
          u.lacona.literal({text: 'def'})
        ]});
      }
    });

    function callback(data) {
      expect(data).to.have.length(3);
      expect(data[1].data.suggestion.charactersComplete).to.equal(4);
      expect(data[1].data.suggestion.words[0].string).to.equal('abc');
      expect(data[1].data.suggestion.words[1].string).to.equal('def');
      done();
    }

    parser.sentences = [test()];
    u.toStream(['ad'])
    .pipe(parser)
    .pipe(u.toArray(callback));
  });

  it('sequence can skip entire elements', function (done) {
    var test = u.lacona.createPhrase({
      name: 'test/test',
      describe: function () {
        return u.lacona.sequence({children: [
          u.lacona.literal({text: 'abc'}),
          u.lacona.literal({text: 'def'}),
          u.lacona.literal({text: 'ghi'}),
          u.lacona.literal({text: 'jkl'})
        ]});
      }
    });

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

    parser.sentences = [test()];
    u.toStream(['agjkl'])
    .pipe(parser)
    .pipe(u.toArray(callback));
  });
});
