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
    };

    var onData = sinon.spy(function (data) {
      expect(['test', 'totally']).to.contain(data.suggestion.words[0].string);
    });

    var onEnd = function() {
      expect(onData).to.have.been.calledTwice;
      done();
    };

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
    };

    var onData = sinon.spy(function (data) {
      expect(['test', 'totally']).to.contain(data.suggestion.words[0].string);
    });

    var onEnd = function() {
      expect(onData).to.have.been.calledTwice;
      done();
    };

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
    };

    var onData = sinon.spy(function (data) {
      expect(data.suggestion.words[0].string).to.equal('test');
    });

    var onEnd = function() {
      expect(onData).to.have.been.calledOnce;
      done();
    };

    parser
    .understand(grammar)
    .on('data', onData)
    .on('end', onEnd)
    .parse('t');
  });

  it('allows for recursive phrases (no infinite loop)', function (done) {
    var grammar = {
      phrases: [{
        name: 'test',
        root: [
          'the', {
            type: 'choice',
            children: [
              'test',
              {type: 'test'}
            ]
          }
        ]
      }]
    };

    var onData = sinon.spy(function (data) {
      expect(['the', 'test']).to.contain(data.suggestion.words[0].string);
    });

    var onEnd = function() {
      expect(onData).to.have.been.calledTwice;
      done();
    };

    parser
    .understand(grammar)
    .on('data', onData)
    .on('end', onEnd)
    .parse('the t');
  });



  it('allows for nested phrases with the same id', function (done) {
    var grammar = {
      phrases: [{
        name: 'test',
        root: { type: 'include1', id: 'test' }
      }, {
        name: 'include1',
        root: { type: 'include2', id: '@value' }
      }, {
        name: 'include2',
        root: { type: 'literal', value: 'test', display: 'test', id: '@value' }
      }]
    };

    var onData = sinon.spy(function (data) {
      expect(data.suggestion.words[0].string).to.equal('test');
      expect(data.result.test).to.equal('test');
    });

    var onEnd = function() {
      expect(onData).to.have.been.calledOnce;
      done();
    };

    parser
    .understand(grammar)
    .on('data', onData)
    .on('end', onEnd)
    .parse('tes');
  });

  it('simply ignores phrases that do not exist', function (done) {
    var grammar = {
      phrases: [{
        name: 'test',
        root: {type: 'nonexistant'}
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
    .parse('t');
  });

  it('throws for phrases without a default-lang schema', function () {
    var grammar = {
      phrases: [{
        name: 'test',
        schemas: [{
          langs: ['en-US'],
          root: 'whatever'
        }]
      }]
    };

    expect(function() {
      parser.understand(grammar);
    }).to.throw(lacona.Error);
  });

  it('throws for phrases without a lang', function () {
    var grammar = {
      phrases: [{
        name: 'test',
        schemas: [{
          root: 'whatever'
        }]
      }]
    };

    expect(function() {
      parser.understand(grammar);
    }).to.throw(lacona.Error);
  });

  it('throws for phrases without a root', function () {
    var grammar = {
      phrases: [{
        name: 'test'
      }]
    };

    expect(function() {
      parser.understand(grammar);
    }).to.throw(lacona.Error);
  });
});
