var chai = require('chai');
var expect = chai.expect;
var lacona;
var sinon = require('sinon');

chai.use(require('sinon-chai'));

if (typeof window !== 'undefined' && window.lacona) {
  lacona = window.lacona;
} else {
  lacona = require('..');
}

describe('Parser', function () {
  var parser;
  beforeEach(function() {
    parser = new lacona.Parser({sentences: ['test']});
  });

  it('never calls data without a schema', function (done) {
    var onData = sinon.spy();

    var onEnd = function () {
      expect(onData).to.not.have.been.called;
      done();
    };

    parser
    .on('data', onData)
    .on('end', onEnd)
    .parse('test');
  });

  it('requires string input', function (done) {
    var onError = sinon.spy(function(err) {
      expect(err).to.be.an.instanceof(lacona.Error);
      done();
    });

    parser
    .on('error', onError)
    .parse(123);
  });

  it('calls end once per parse', function () {
    var grammar = {
      phrases: [{
        name: 'test',
        root: 'test',
      }]
    };

    var onData = sinon.spy();

    var onEnd = sinon.spy();

    parser
      .understand(grammar)
      .on('data', onData)
      .on('end', onEnd)
      .parse('t')
      .parse('t');

    expect(onData).to.have.been.calledTwice;
    expect(onEnd).to.have.been.calledTwice;
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

    var onData = sinon.spy(function (data) {
      expect(data.suggestion.words[0].string).to.equal('prueba');
    });

    var onEnd = function () {
      expect(onData).to.have.been.calledOnce;
      done();
    };

    parser.langs = ['es'];

    parser
    .understand(grammar)
    .on('data', onData)
    .on('end', onEnd)
    .parse('p');
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

    var onData = sinon.spy(function (data) {
      expect(data.suggestion.words[0].string).to.equal('tren');
    });

    var onEnd = function () {
      expect(onData).to.have.been.calledOnce;
      done();
    };

    parser.langs = ['es_ES'];

    parser
    .understand(grammar)
    .on('data', onData)
    .on('end', onEnd)
    .parse('tr');
  });

  it('will not emit data but will emit end for an old parse', function (done) {
    var grammar = {
      scope: {
        delay: function (result, done) {
          process.nextTick(done);
        }
      },
      phrases: [{
        name: 'delay',
        root: 'test',
        evaluate: 'delay'
      }, {
        name: 'test',
        root: {
          type: 'delay'
        }
      }]
    };


    var onData = sinon.spy();

    var onEnd = sinon.spy(function() {
      if (onEnd.calledOnce) {
        expect(onData).to.not.have.been.called;
      } else if (onEnd.calledTwice) {
        expect(onData).to.have.been.calledOnce;
        done();
      }
    });

    parser
    .understand(grammar)
    .on('data', onData)
    .on('end', onEnd)
    .parse('test')
    .parse('test');
  });

  it('emits a start event', function(done) {
    var onStart = sinon.spy();

    function onEnd() {
      expect(onStart).to.have.been.called;
      done();
    }

    parser
      .on('start', onStart)
      .on('end', onEnd)
      .parse('test');
  });

  it('requires grammars to have phrases', function () {

    var grammar = {};

    expect(function () {
      parser.understand(grammar);
    }).to.throw(lacona.Error);
  });


  it('requires placeholders to have type', function () {

    var grammar = {
      phrases: [{}]
    };

    expect(function () {
      parser.understand(grammar);
    }).to.throw(lacona.Error);
  });

});
