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
        extends: ['extended'],
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
});