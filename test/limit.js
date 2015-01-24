var chai = require('chai');
var expect = chai.expect;
var u = require('./util');

describe('limit', function() {
  var parser;

  beforeEach(function() {
    parser = new u.lacona.Parser();
  });

  it('handles a value with a limit', function (done) {
    var test = u.lacona.createPhrase({
      name: 'test/test',
      compute: function (input, data, done) {
        data({text: 'testa'});
        data({text: 'testb'});
        data({text: 'testc'});
        done();
      },
      describe: function () {
        return u.lacona.value({limit: 2, compute: this.compute});
      }
    });

    function callback(data) {
      expect(data).to.have.length(4);
      expect(u.ft.all(data[1].data)).to.equal('testa');
      expect(u.ft.all(data[2].data)).to.equal('testb');
      done();
    }

    parser.sentences = [test()];
    u.toStream(['test'])
      .pipe(parser)
      .pipe(u.toArray(callback));
  });
});
