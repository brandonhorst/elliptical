var chai = require('chai');
var es = require('event-stream');
var expect = chai.expect;
var fulltext = require('lacona-util-fulltext');
var lacona = require('..');

describe('join', function () {
  var parser;
  beforeEach(function() {
    parser = new lacona.Parser();
  });

  it('joins literals onto the suggestion', function (done) {
    var test = lacona.createPhrase({
      name: 'test/test',
      describe: function () {
        return lacona.sequence({children: [
          lacona.literal({text: 'aaa'}),
          lacona.literal({text: 'bbb', join: true})
          ]});
        }
      });

    function callback(err, data) {
      expect(data).to.have.length(3);
      expect(fulltext.suggestion(data[1].data)).to.equal('aaabbb');
      done();
    }

    parser.sentences = [test()];

    es.readArray(['a'])
      .pipe(parser)
      .pipe(es.writeArray(callback));
  });
});
