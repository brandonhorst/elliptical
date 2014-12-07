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

chai.config.includeStack = true;

describe('sequence', function() {
  var parser;

  beforeEach(function() {
    parser = new lacona.Parser({sentences: ['test']});
  });

  it('puts two elements in order', function (done) {
    var grammar = {
      phrases: [{
        name: 'test',
        root: {
          type: 'sequence',
          children: [
            'super',
            'man'
          ]
        }
      }]
    };

    var onData = sinon.spy(function(data) {
      expect(data.suggestion.words[0].string).to.equal('man');
      expect(data.result).to.be.empty;
    });

    var onEnd = function() {
      expect(onData).to.have.been.calledOnce;
      done();
    };

    parser
    .understand(grammar)
    .on('data', onData)
    .on('end', onEnd)
    .parse('super m');
  });

  it('empty separator', function (done) {
    var grammar = {
      phrases: [{
        name: 'test',
        root: {
          type: 'sequence',
          children: [
            'super',
            'man'
          ],
          separator: ''
        }
      }]
    };

    var onData = sinon.spy(function(data) {
      expect(data.suggestion.words[0].string).to.equal('man');
      expect(data.result).to.be.empty;
    });

    var onEnd = function() {
      expect(onData).to.have.been.calledOnce;
      done();
    };

    parser
    .understand(grammar)
    .on('data', onData)
    .on('end', onEnd)
    .parse('superm');
  });


  it('rejects input with a separator at the end', function (done) {
    var grammar = {
      phrases: [{
        name: 'test',
        root: {
          type: 'sequence',
          children: [
            'super',
            'man'
          ]
        }
      }]
    };

    var onData = sinon.spy();

    var onEnd = function() {
      expect(onData).to.not.have.been.called;
      done();
    };

    parser
    .understand(grammar)
    .on('data', onData)
    .on('end', onEnd)
    .parse('super man ');
  });

  it('custom separator', function (done) {
    var grammar = {
      phrases: [{
        name: 'test',
        root: {
          type: 'sequence',
          children: [
            'super',
            'man'
          ],
          separator: ' test '
        }
      }]
    };

    var onData = sinon.spy(function(data) {
      expect(data.suggestion.words[0].string).to.equal('man');
    });

    var onEnd = function() {
      expect(onData).to.have.been.calledOnce;
      done();
    };

    parser
    .understand(grammar)
    .on('data', onData)
    .on('end', onEnd)
    .parse('super test m');
  });

  it('optional child', function (done) {
    var grammar = {
      phrases: [{
        name: 'test',
        root: {
          type: 'sequence',
          children: [
            'super', {
              type: 'literal',
              optional: 'true',
              display: 'maximum',
              value: 'optionalValue',
              id: 'optionalId',
            },
            'man'
          ]
        }
      }]
    };

    var onData = sinon.spy(function(data) {
      expect(['maximum', 'man']).to.contain(data.suggestion.words[0].string);
      if (data.suggestion.words[0].string === 'maximum') {
        expect(data.result.optionalId).to.equal('optionalValue');
      } else {
        expect(data.result).to.be.empty;
      }
    });

    var onEnd = function() {
      expect(onData).to.have.been.called.twice;
      done();
    };

    parser
    .understand(grammar)
    .on('data', onData)
    .on('end', onEnd)
    .parse('super m');
  });

  it('can set a value to the result', function (done) {
    var grammar = {
      phrases: [{
        name: 'test',
        root: {
          type: 'sequence',
          id: 'testId',
          value: 'testValue',
          children: [
            'super',
            'man'
          ]
        }
      }]
    };

    var onData = sinon.spy(function(data) {
      expect(data.result.testId).to.equal('testValue');
    });

    var onEnd = function() {
      expect(onData).to.have.been.calledOnce;
      done();
    };

    parser
    .understand(grammar)
    .on('data', onData)
    .on('end', onEnd)
    .parse('super m');
  });
});
