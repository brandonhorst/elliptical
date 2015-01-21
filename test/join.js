var chai = require('chai');
var expect = chai.expect;
var u = require('./util');

describe('join', function () {
  var parser;
  beforeEach(function() {
    parser = new u.lacona.Parser();
  });

  it('joins literals onto the suggestion', function (done) {
    var test = u.lacona.createPhrase({
      name: 'test/test',
      describe: function () {
        return u.lacona.sequence({children: [
          u.lacona.literal({text: 'aaa'}),
          u.lacona.literal({text: 'bbb', join: true})
          ]});
        }
      });

    function callback(data) {
      expect(data).to.have.length(3);
      expect(u.ft.suggestion(data[1].data)).to.equal('aaabbb');
      done();
    }

    parser.sentences = [test()];

    u.toStream(['a'])
      .pipe(parser)
      .pipe(u.toArray(callback));
  });
});
