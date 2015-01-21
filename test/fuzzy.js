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
        expect(u.ft.suggestion(data[1].data)).to.equal('a simple test');
        expect(data[1].data.suggestion[0].string).to.equal('a');
        expect(data[1].data.suggestion[0].input).to.be.true;
        expect(data[1].data.suggestion[1].string).to.equal(' ');
        expect(data[1].data.suggestion[1].input).to.be.false;
        expect(data[1].data.suggestion[2].string).to.equal('s');
        expect(data[1].data.suggestion[2].input).to.be.true;
        expect(data[1].data.suggestion[3].string).to.equal('i');
        expect(data[1].data.suggestion[3].input).to.be.false;
        expect(data[1].data.suggestion[4].string).to.equal('m');
        expect(data[1].data.suggestion[4].input).to.be.true;
        expect(data[1].data.suggestion[5].string).to.equal('p');
        expect(data[1].data.suggestion[5].input).to.be.false;
        expect(data[1].data.suggestion[6].string).to.equal('l');
        expect(data[1].data.suggestion[6].input).to.be.true;
        expect(data[1].data.suggestion[7].string).to.equal('e ');
        expect(data[1].data.suggestion[7].input).to.be.false;
        expect(data[1].data.suggestion[8].string).to.equal('te');
        expect(data[1].data.suggestion[8].input).to.be.true;
        expect(data[1].data.suggestion[9].string).to.equal('st');
        expect(data[1].data.suggestion[9].input).to.be.false;
        done();
      }

      parser.sentences = [test()];
      u.toStream(['asmlte'])
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
        expect(data[1].data.suggestion[0].string).to.equal('a simple test');
        expect(data[1].data.suggestion[0].input).to.be.false;
        expect(u.ft.suggestion(data[1].data)).to.equal('a simple test');
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
      expect(u.ft.suggestion(data[1].data)).to.equal('[whatever]');
      expect(data[1].data.suggestion[0].string).to.equal('[');
      expect(data[1].data.suggestion[0].input).to.be.true;
      expect(data[1].data.suggestion[1].string).to.equal('whatever');
      expect(data[1].data.suggestion[1].input).to.be.false;
      expect(data[1].data.suggestion[2].string).to.equal(']');
      expect(data[1].data.suggestion[2].input).to.be.true;
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
      expect(u.ft.suggestion(data[1].data)).to.equal('abcdef');
      expect(data[1].data.suggestion[0].string).to.equal('a');
      expect(data[1].data.suggestion[0].input).to.be.true;
      expect(data[1].data.suggestion[1].string).to.equal('bc');
      expect(data[1].data.suggestion[1].input).to.be.false;
      expect(data[1].data.suggestion[2].string).to.equal('d');
      expect(data[1].data.suggestion[2].input).to.be.true;
      expect(data[1].data.suggestion[3].string).to.equal('ef');
      expect(data[1].data.suggestion[3].input).to.be.false;
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
      expect(u.ft.suggestion(data[1].data)).to.equal('abcdefghijkl');
      expect(data[1].data.suggestion[0].string).to.equal('a');
      expect(data[1].data.suggestion[0].input).to.be.true;
      expect(data[1].data.suggestion[1].string).to.equal('bcdef');
      expect(data[1].data.suggestion[1].input).to.be.false;
      expect(data[1].data.suggestion[2].string).to.equal('g');
      expect(data[1].data.suggestion[2].input).to.be.true;
      expect(data[1].data.suggestion[3].string).to.equal('hi');
      expect(data[1].data.suggestion[3].input).to.be.false;
      expect(data[1].data.suggestion[4].string).to.equal('jkl');
      expect(data[1].data.suggestion[4].input).to.be.true;
      expect(data[1].data.match).to.be.empty;
      done();
    }

    parser.sentences = [test()];
    u.toStream(['agjkl'])
      .pipe(parser)
      .pipe(u.toArray(callback));
  });


  it('handles a choice', function (done) {
    var test = u.lacona.createPhrase({
      name: 'test/test',
      describe: function () {
        return u.lacona.sequence({children: [
          u.lacona.literal({text: 'abc'}),
          u.lacona.choice({children: [
            u.lacona.literal({text: 'def'}),
            u.lacona.literal({text: 'ghi'}),
          ]})
        ]});
      }
    });

    function callback(data) {
      expect(data).to.have.length(4);
      expect(u.ft.suggestion(data[1].data)).to.equal('abc');
      expect(u.ft.completion(data[1].data)).to.equal('def');
      expect(u.ft.suggestion(data[2].data)).to.equal('abc');
      expect(u.ft.completion(data[2].data)).to.equal('ghi');
      done();
    }

    parser.sentences = [test()];
    u.toStream(['ab'])
      .pipe(parser)
      .pipe(u.toArray(callback));
  });
});
