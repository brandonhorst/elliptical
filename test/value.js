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

  it('suggests a value', function (done) {
    var grammar = {
      scope: {
        fun: function (input, data, done) {
          data({display: 'disp', value: 'val'});
          done();
        }
      },
      phrases: [{
        name: 'test',
        root: {type: 'value', compute: 'fun', id: 'test'}
      }]
    };

    var onData = sinon.spy(function (data) {
      expect(data.result.test).to.equal('val');
      expect(data.suggestion.words[0].string).to.equal('disp');
    });

    var onEnd = function () {
      expect(onData).to.have.been.calledOnce;
      done();
    };

    parser
    .understand(grammar)
    .on('data', onData)
    .on('end', onEnd)
    .parse('di');
  });

  it('can access variables in parent in its function', function (done) {
    var fun = sinon.spy(function (input, data, done) {
      expect(this.myVar).to.equal('myVal');
      data({display: 'disp', value: 'val'});
      done();
    });

    var grammar = {
      phrases: [{
        name: 'test',
        root: {type: 'depPhrase', myVar: 'myVal'}
      }],
      dependencies: [{
        scope: {depFun: fun},
        phrases: [{
          name: 'depPhrase',
          root: {type: 'value', compute: 'depFun'}
        }]
      }]
    };

    var onEnd = function () {
      expect(fun).to.have.been.calledOnce;
      done();
    };

    parser
    .understand(grammar)
    .on('end', onEnd)
    .parse('di');
  });

  it('can $call functions defined', function (done) {
    var fun = sinon.spy(function (done) {
      done();
    });

    var grammar = {
      scope: {fun: fun},
      phrases: [{
        name: 'test',
        root: {type: 'depPhrase'}
      }],
      dependencies: [{
        scope: {
          depFun: function (input, data, done) {
            this.$call('fun', function (err) {
              expect(err).to.not.exist;
            });
            done();
          }
        },
        phrases: [{
          name: 'depPhrase',
          root: {type: 'value', compute: 'depFun'}
        }]
      }]
    };

    var onEnd = function () {
      expect(fun).to.have.been.calledOnce;
      done();
    };

    parser
    .understand(grammar)
    .on('end', onEnd)
    .parse('di');
  });

  it('can $call functions defined with variables', function (done) {
    var fun = sinon.spy(function (done) {
      expect(this.myVar).to.equal('myVal');
      done();
    });

    var grammar = {
      scope: {fun: fun},
      phrases: [{
        name: 'test',
        root: {type: 'depPhrase', myVar: 'myVal'}
      }],
      dependencies: [{
        scope: {
          depFun: function (input, data, done) {
            this.$call('fun', function (err) {
              expect(err).to.not.exist;
            });
            done();
          }
        },
        phrases: [{
          name: 'depPhrase',
          root: {type: 'value', compute: 'depFun'}
        }]
      }]
    };

    var onEnd = function () {
      expect(fun).to.have.been.calledOnce;
      done();
    };

    parser
    .understand(grammar)
    .on('end', onEnd)
    .parse('di');
  });

  it('has no variables when called in a sentence', function (done) {
    var fun = sinon.spy(function (input, data, done) {
      expect(this.myVar).to.not.exist;
      done();
    });

    var grammar = {
      scope: {fun: fun},
      phrases: [{
        name: 'test',
        myVar: 'myVal', //this is never used
        root: {type: 'value', compute: 'fun'}
      }]
    };

    var onEnd = function () {
      expect(fun).to.have.been.calledOnce;
      done();
    };

    parser
    .understand(grammar)
    .on('end', onEnd)
    .parse('di');
  });

});
