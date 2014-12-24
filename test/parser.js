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

  it('never calls data without a schema', function (done) {
    function callback(data) {
      expect(data).to.be.empty;
      done();
    }

    testUtil.toStream(['test'])
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
      expect(data).to.have.length(2);
      expect(data[0].id).to.not.equal(data[1].id);
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
      expect(data).to.have.length(1);
      expect(data[0].suggestion.words[0].string).to.equal('prueba');
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
      expect(data).to.have.length(1);
      expect(data[0].suggestion.words[0].string).to.equal('tren');
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

});
