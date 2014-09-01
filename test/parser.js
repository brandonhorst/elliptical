var _ = require('lodash');
var async = require('async');
var chai = require('chai');
var expect = chai.expect;
var lacona;
var sinon = require('sinon');

chai.use(require('sinon-chai'));

if (typeof window !== 'undefined' && window.lacona) {
  lacona = window.lacona;
} else {
  lacona = require('../lib/lacona');
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
    }

    parser
    .on('data', onData)
    .on('end', onEnd)
    .parse();
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

    parser
    .understand(grammar)
    .on('data', onData)
    .on('end', onEnd)
    .parse('p', 'es');
  });

  it('falls back on a less specific language if a more specific one is not provided', function (done) {
    var grammar = {
      phrases: [{
        name: 'test',
        schemas: [{
          langs: ['en_GB', 'default'],
          root: 'trolley'
        }, {
          langs: ['en'],
          root: 'train'
        }]
      }]
    };

    var onData = sinon.spy(function (data) {
      expect(data.suggestion.words[0].string).to.equal('train');
    });

    var onEnd = function () {
      expect(onData).to.have.been.calledOnce;
      done();
    };

    parser
    .understand(grammar)
    .on('data', onData)
    .on('end', onEnd)
    .parse('tr', 'en_US');
  });

  it('if no language is provded, takes the default specified by the system (window.nagivator.language or process.env.LANG)', function (done) {
    var grammar = {
      phrases: [{
        name: 'test',
        schemas: [{
          langs: ['es'],
          root: 'prueba'
        }, {
          langs: ['en', 'default'],
          root: 'test'
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

    if (typeof window !== 'undefined') {
      window.navigator = {
        language: 'es_ES'
      };
    } else {
      process.env.LANG = 'es_ES.UTF-8';
    }

    parser
    .understand(grammar)
    .on('data', onData)
    .on('end', onEnd)
    .parse('pr');
  });


  it('will not throw data for an old parse', function (done) {
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
    }

    var sentence = {
      name: 'test',
      root: {
        type: 'delay'
      }
    }

    var onData = sinon.spy();

    var onEnd = function() {
      expect(onData).to.have.been.calledOnce;
      done();
    }

    parser
    .understand(grammar)
    .on('data', onData)
    .on('end', onEnd)
    .parse('test')
    .parse('test');
  });

});