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

describe('dependencies', function () {
  var parser;
  beforeEach(function() {
    parser = new lacona.Parser({sentences: ['test']});
  });

  it('handles basic dependencies', function (done) {
    var grammar = {
      phrases: [{
        name: 'test',
        root: {type: 'dep'}
      }],
      dependencies: [{
        phrases: [{
          name: 'dep',
          root: 'something'
        }]
      }]
    }

    var onData = sinon.spy(function (data) {
      expect(data.suggestion.words[0].string).to.equal("something");
    });

    var onEnd = function() {
      expect(onData).to.have.been.calledOnce;
      done();
    }

    parser
    .understand(grammar)
    .on('data', onData)
    .on('end', onEnd)
    .parse('s');
  });

});