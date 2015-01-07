var chai = require('chai');
var sinon = require('sinon');
var expect = chai.expect;
var testUtil = require('./util.js');

chai.use(require('sinon-chai'));

describe('Parser', function () {
  var parser;
  beforeEach(function() {
    parser = new testUtil.lacona.Parser({sentences: ['test']});
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

    testUtil.toStream(['test'])
      .pipe(parser)
      .pipe(testUtil.toArray(callback));
  });

  it ('will clear out an understood grammar', function (done) {
    var grammar = {
      phrases: [{
        name: 'test',
        root: 'test',
      }]
    };

    function callback(data) {
      expect(data).to.have.length(2);
      done();
    }

    parser.understand(grammar).clearGrammars();

    testUtil.toStream(['t'])
      .pipe(parser)
      .pipe(testUtil.toArray(callback));
  });

  it('requires string input', function (done) {
    var callback = sinon.spy(function (err) {
      expect(err).to.be.an.instanceof(testUtil.lacona.Error);
      done();
    });

    testUtil.toStream([123])
      .pipe(parser)
      .on('error', callback);
  });

  it('parses have separate ids', function (done) {
    var grammar = {
      phrases: [{
        name: 'test',
        root: 'test',
      }]
    };

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

    parser.understand(grammar);
    testUtil.toStream(['t', 't'])
      .pipe(parser)
      .pipe(testUtil.toArray(callback));
  });


  it('can parse in a specified language', function (done) {
    var grammar = {
      phrases: [{
        name: 'test',
        schemas: [{
          langs: ['en', 'default'],
          root: 'test'
        }, {
          langs: ['es'],
          root: 'prueba'
        }]
      }]
    };

    function callback(data) {
      expect(data).to.have.length(3);
      expect(data[1].data.suggestion.words[0].string).to.equal('prueba');
      done();
    }

    parser.langs = ['es'];
    parser.understand(grammar);
    testUtil.toStream(['p'])
      .pipe(parser)
      .pipe(testUtil.toArray(callback));
  });

  it('falls back on a less specific language if a more specific one is not provided', function (done) {
    var grammar = {
      phrases: [{
        name: 'test',
        schemas: [{
          langs: ['en', 'default'],
          root: 'train'
        }, {
          langs: ['es'],
          root: 'tren'
        }]
      }]
    };

    function callback(data) {
      expect(data).to.have.length(3);
      expect(data[1].data.suggestion.words[0].string).to.equal('tren');
      done();
    }

    parser.langs = ['es_ES'];

    parser.understand(grammar);
    testUtil.toStream(['tr'])
      .pipe(parser)
      .pipe(testUtil.toArray(callback));
  });

  it('requires grammars to have phrases', function () {

    var grammar = {};

    expect(function () {
      parser.understand(grammar);
    }).to.throw(testUtil.lacona.Error);
  });


  it('requires placeholders to have type', function () {

    var grammar = {
      phrases: [{}]
    };

    expect(function () {
      parser.understand(grammar);
    }).to.throw(testUtil.lacona.Error);
  });

  describe('async parse', function () {
    var grammar = {
      scope: {
        delay: function (input, data, done) {
          setTimeout(function () {
            data({display: 'test', value: 'test'});
            done();
          }, 0);
        }
      },
      phrases: [{
        name: 'test',
        root: {
          type: 'value',
          compute: 'delay'
        }
      }]
    };

    it('passes start and end for async parse', function(done) {

      function callback(data) {
        expect(data).to.have.length(2);
        expect(data[0].event).to.equal('start');
        expect(data[1].event).to.equal('end');
        expect(data[0].id).to.equal(data[1].id);
        expect(data[0].id).to.equal(0);
        done();
      }
      parser.understand(grammar);
      testUtil.toStream(['invalid'])
        .pipe(parser)
        .pipe(testUtil.toArray(callback));
    });
  });
});
