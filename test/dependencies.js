var chai = require('chai');
var es = require('event-stream');
var expect = chai.expect;
var fulltext = require('lacona-util-fulltext');
var lacona = require('..');

describe('dependencies', function () {
  var parser;
  beforeEach(function() {
    parser = new lacona.Parser();
  });

  it('handles basic dependencies', function (done) {
    var dep = lacona.createPhrase({
      name: 'test/dep',
      describe: function () {
        return lacona.literal({text: 'something'});
      }
    });

    var test = lacona.createPhrase({
      name: 'test/test',
      describe: function () {
        return dep();
      }
    });

    function callback(err, data) {
      expect(data).to.have.length(3);
      expect(fulltext.suggestion(data[1].data)).to.equal('something');
      done();
    }

    parser.sentences = [test()];
    es.readArray(['s'])
      .pipe(parser)
      .pipe(es.writeArray(callback));
  });

});
