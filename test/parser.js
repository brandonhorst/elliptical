var chai = require('chai');
var es = require('event-stream');
var expect = chai.expect;
var fulltext = require('lacona-util-fulltext');
var lacona = require('..');
var sinon = require('sinon');

chai.use(require('sinon-chai'));

describe('Parser', function () {
  var parser;
  beforeEach(function() {
    parser = new lacona.Parser();
  });

  it('passes start and end for sync parse', function (done) {
    function callback(err, data) {
      expect(data).to.have.length(2);
      expect(data[0].event).to.equal('start');
      expect(data[1].event).to.equal('end');
      expect(data[0].id).to.equal(data[1].id);
      expect(data[0].id).to.equal(0);
      done();
    }

    es.readArray(['test'])
      .pipe(parser)
      .pipe(es.writeArray(callback));
  });

  it('requires string input', function (done) {
    var callback = sinon.spy(function (err) {
      expect(err).to.be.an.instanceof(lacona.Error);
      done();
    });

    es.readArray([123])
      .pipe(parser)
      .on('error', callback);
  });

  it('allows object input if it has a data property', function (done) {
    function callback(err, data) {
      expect(data).to.have.length(2);
      expect(data[0].event).to.equal('start');
      expect(data[1].event).to.equal('end');
      expect(data[0].id).to.equal(data[1].id);
      expect(data[0].id).to.equal(0);
      done();
    }

    es.readArray([{data: 'test'}])
      .pipe(parser)
      .pipe(es.writeArray(callback));
  });

  it('passes a given group', function (done) {
    var test = lacona.createPhrase({
      name: 'test/test',
      describe: function () {
        return lacona.literal({text: 'test'});
      }
    });

    function callback(err, data) {
      expect(data).to.have.length(3);
      expect(data[0].event).to.equal('start');
      expect(data[0].group).to.equal('someGroup');
      expect(data[1].event).to.equal('data');
      expect(data[1].group).to.equal('someGroup');
      expect(data[2].event).to.equal('end');
      expect(data[2].group).to.equal('someGroup');
      done();
    }

    parser.sentences = [test()];
    es.readArray([{group: 'someGroup', data: 'test'}])
      .pipe(parser)
      .pipe(es.writeArray(callback));
  });

  it('parses have separate ids', function (done) {
    var test = lacona.createPhrase({
      name: 'test/test',
      describe: function () {
        return lacona.literal({text: 'test'});
      }
    });

    function callback(err, data) {
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
    es.readArray(['t', 't'])
      .pipe(parser)
      .pipe(es.writeArray(callback));
  });

  it('passes the sentence name to the output', function (done) {
    var test = lacona.createPhrase({
      name: 'test/test',
      describe: function () {
        return lacona.literal({text: 'test'});
      }
    });

    function callback(err, data) {
      expect(data).to.have.length(3);
      expect(data[1].data.sentence).to.equal('test/test');
      done();
    }

    parser.sentences = [test()];
    es.readArray(['t'])
      .pipe(parser)
      .pipe(es.writeArray(callback));
  });


  it('can parse in a specified language', function (done) {
    var test = lacona.createPhrase({
      name: 'test/test',
      translations: [{
        langs: ['en', 'default'],
        describe: function () {
          return lacona.literal({text: 'test'});
        }
      }, {
        langs: ['es'],
        describe: function () {
          return lacona.literal({text: 'prueba'});
        }
      }]
    });

    function callback(err, data) {
      expect(data).to.have.length(3);
      expect(fulltext.suggestion(data[1].data)).to.equal('prueba');
      done();
    }

    parser.langs = ['es'];
    parser.sentences = [test()];

    es.readArray(['p'])
      .pipe(parser)
      .pipe(es.writeArray(callback));
  });

  it('falls back on a less specific language if a more specific one is not provided', function (done) {
    var test = lacona.createPhrase({
      name: 'test/test',
      translations: [{
        langs: ['en', 'default'],
        describe: function () {
          return lacona.literal({text: 'train'});
        }
      }, {
        langs: ['es'],
        describe: function () {
          return lacona.literal({text: 'tren'});
        }
      }]
    });

    function callback(err, data) {
      expect(data).to.have.length(3);
      expect(fulltext.suggestion(data[1].data)).to.equal('tren');
      done();
    }

    parser.langs = ['es_ES'];

    parser.sentences = [test()];
    es.readArray(['tr'])
      .pipe(parser)
      .pipe(es.writeArray(callback));
  });

  describe('async parse', function () {
    var test;

    beforeEach(function () {
      test = lacona.createPhrase({
        name: 'test/test',
        delay: function (input, data, done) {
          setTimeout(function () {
            data({text: 'test', value: 'test'});
            done();
          }, 0);
        },
        describe: function () {
          return lacona.value({compute: this.delay});
        }
      });
    });

    it('passes start and end for async parse', function(done) {
      function callback(err, data) {
        expect(data).to.have.length(2);
        expect(data[0].event).to.equal('start');
        expect(data[1].event).to.equal('end');
        expect(data[0].id).to.equal(data[1].id);
        expect(data[0].id).to.equal(0);
        done();
      }

      parser.sentences = [test()];

      es.readArray(['invalid'])
      .pipe(parser)
      .pipe(es.writeArray(callback));
    });

    it('passes data between start and end for async parse', function(done) {
      function callback(err, data) {
        expect(data).to.have.length(3);
        expect(data[0].event).to.equal('start');
        expect(fulltext.suggestion(data[1].data)).to.equal('test');
        expect(data[2].event).to.equal('end');
        expect(data[0].id).to.equal(data[2].id);
        expect(data[0].id).to.equal(0);
        done();
      }

      parser.sentences = [test()];

      es.readArray(['t'])
      .pipe(parser)
      .pipe(es.writeArray(callback));
    });
  });
});
