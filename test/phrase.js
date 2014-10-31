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

  it('handles phrases with extension', function (done) {
    var grammar = {
      phrases: [{
        name: 'extended',
        root: 'test'
      }, {
        name: 'extender',
        inherits: ['extended'],
        root: 'totally'
      }, {
        name: 'test',
        root: {type: 'extended'}
      }]
    }

    var onData = sinon.spy(function (data) {
      expect(['test', 'totally']).to.contain(data.suggestion.words[0].string);
    });

    var onEnd = function() {
      expect(onData).to.have.been.calledTwice;
      done();
    }

    parser
    .understand(grammar)
    .on('data', onData)
    .on('end', onEnd)
    .parse('t');
  });

  it('handles phrases with extension and a specified version', function (done) {
    var grammar = {
      phrases: [{
        name: 'extended',
        version: '1.2.3',
        root: 'test'
      }, {
        name: 'extender',
        inherits: {extended: '^1.0.0'},
        root: 'totally'
      }, {
        name: 'test',
        root: {type: 'extended'}
      }]
    }

    var onData = sinon.spy(function (data) {
      expect(['test', 'totally']).to.contain(data.suggestion.words[0].string);
    });

    var onEnd = function() {
      expect(onData).to.have.been.calledTwice;
      done();
    }

    parser
    .understand(grammar)
    .on('data', onData)
    .on('end', onEnd)
    .parse('t');
  });

  it('rejects phrases with an incorrect version specified version', function (done) {
    var grammar = {
      phrases: [{
        name: 'extended',
        version: '2.3.4',
        root: 'test'
      }, {
        name: 'extender',
        inherits: {extended: '^1.0.0'},
        root: 'totally'
      }, {
        name: 'test',
        root: {type: 'extended'}
      }]
    }

    var onData = sinon.spy(function (data) {
      expect(data.suggestion.words[0].string).to.equal('test');
    });

    var onEnd = function() {
      expect(onData).to.have.been.calledOnce;
      done();
    }

    parser
    .understand(grammar)
    .on('data', onData)
    .on('end', onEnd)
    .parse('t');
  });

  it('simply ignores phrases that do not exist', function (done) {
    var grammar = {
      phrases: [{
        name: 'test',
        root: {type: 'nonexistant'}
      }]
    }

    var onData = sinon.spy();

    var onEnd = function() {
      expect(onData).to.not.have.been.called;
      done();
    }

    parser
    .understand(grammar)
    .on('data', onData)
    .on('end', onEnd)
    .parse('t');

  });
});
