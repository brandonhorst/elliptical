var chai = require('chai');
var sinon = require('sinon');
var expect = chai.expect;
var u = require('./util');

chai.use(require('sinon-chai'));

describe('Parser', function () {
  var parser;
  beforeEach(function() {
    parser = new u.lacona.Parser();
  });

  it('passes start and end for sync parse', function (done) {
    function callback(data) {
      expect(data).to.have.length(2);
      expect(data[0].event).to.equal('start');
      expect(data[1].event).to.equal('end');
      expect(data[0].id).to.equal(data[1].id);
      expect(data[0].id).to.equal(0);
      done();
    }

    u.toStream(['test'])
      .pipe(parser)
      .pipe(u.toArray(callback));
  });

  it('requires string input', function (done) {
    var callback = sinon.spy(function (err) {
      expect(err).to.be.an.instanceof(u.lacona.Error);
      done();
    });

    u.toStream([123])
      .pipe(parser)
      .on('error', callback);
  });

  it('parses have separate ids', function (done) {
    var test = u.lacona.createPhrase({
      name: 'test/test',
      describe: function () {
        return u.lacona.literal({text: 'test'});
      }
    });

    function callback(data) {
      expect(data).to.have.length(6);
      expect(data[0].event).to.equal('start');
      expect(data[2].event).to.equal('end');
      expect(data[3].event).to.equal('start');
      expect(data[5].event).to.equal('end');
      expect(data[1].id).to.equal(data[0].id);
      expect(data[1].id).to.equal(data[2].id);
      expect(data[4].id).to.equal(data[3].id);
      expect(data[4].id).to.equal(data[5].id);
      expect(data[1].id).to.be.below(data[4].id);
      done();
    }

    parser.sentences = [test()];
    u.toStream(['t', 't'])
      .pipe(parser)
      .pipe(u.toArray(callback));
  });


  it('can parse in a specified language', function (done) {
    var test = u.lacona.createPhrase({
      name: 'test/test',
      translations: [{
        langs: ['en', 'default'],
        describe: function () {
          return u.lacona.literal({text: 'test'});
        }
      }, {
        langs: ['es'],
        describe: function () {
          return u.lacona.literal({text: 'prueba'});
        }
      }]
    });

    function callback(data) {
      expect(data).to.have.length(3);
      expect(data[1].data.suggestion.words[0].string).to.equal('prueba');
      done();
    }

    parser.langs = ['es'];
    parser.sentences = [test()];

    u.toStream(['p'])
      .pipe(parser)
      .pipe(u.toArray(callback));
  });

  it('falls back on a less specific language if a more specific one is not provided', function (done) {
    var test = u.lacona.createPhrase({
      name: 'test/test',
      translations: [{
        langs: ['en', 'default'],
        describe: function () {
          return u.lacona.literal({text: 'train'});
        }
      }, {
        langs: ['es'],
        describe: function () {
          return u.lacona.literal({text: 'tren'});
        }
      }]
    });

    function callback(data) {
      expect(data).to.have.length(3);
      expect(data[1].data.suggestion.words[0].string).to.equal('tren');
      done();
    }

    parser.langs = ['es_ES'];

    parser.sentences = [test()];
    u.toStream(['tr'])
      .pipe(parser)
      .pipe(u.toArray(callback));
  });

  describe('async parse', function () {
    var test;

    beforeEach(function () {
      test = u.lacona.createPhrase({
        name: 'test/test',
        delay: function (input, data, done) {
          setTimeout(function () {
            data({text: 'test', value: 'test'});
            done();
          }, 0);
        },
        describe: function () {
          return u.lacona.value({compute: this.delay});
        }
      });
    });

    it('passes start and end for async parse', function(done) {
      function callback(data) {
        expect(data).to.have.length(2);
        expect(data[0].event).to.equal('start');
        expect(data[1].event).to.equal('end');
        expect(data[0].id).to.equal(data[1].id);
        expect(data[0].id).to.equal(0);
        done();
      }

      parser.sentences = [test()];

      u.toStream(['invalid'])
      .pipe(parser)
      .pipe(u.toArray(callback));
    });

    it('passes data between start and end for async parse', function(done) {
      function callback(data) {
        expect(data).to.have.length(3);
        expect(data[0].event).to.equal('start');
        expect(data[1].data.suggestion.words[0].string).to.equal('test');
        expect(data[2].event).to.equal('end');
        expect(data[0].id).to.equal(data[2].id);
        expect(data[0].id).to.equal(0);
        done();
      }

      parser.sentences = [test()];

      u.toStream(['t'])
      .pipe(parser)
      .pipe(u.toArray(callback));
    });
  });

  describe('utils', function () {
    it('returns all substrings', function() {
      var input = "asdf";
      var substrings = u.lacona.util.substrings(input)

      expect(substrings).to.have.length(4);
      expect(substrings).to.contain('a');
      expect(substrings).to.contain('as');
      expect(substrings).to.contain('asd');
      expect(substrings).to.contain('asdf');
    });
  });
});
