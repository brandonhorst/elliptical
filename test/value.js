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

});