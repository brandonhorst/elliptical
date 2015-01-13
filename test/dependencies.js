var chai = require('chai');
var expect = chai.expect;
var u = require('./util');

describe('dependencies', function () {
  var parser;
  beforeEach(function() {
    parser = new u.lacona.Parser();
  });

  it('handles basic dependencies', function (done) {
    var dep = u.lacona.createPhrase({
      name: 'test/dep',
      describe: function () {
        return u.lacona.literal({text: 'something'});
      }
    });

    var test = u.lacona.createPhrase({
      name: 'test/test',
      describe: function () {
        return dep();
      }
    });

    function callback(data) {
      expect(data).to.have.length(3);
      expect(data[1].data.suggestion.words[0].string).to.equal('something');
      done();
    }

    parser.sentences = [test()];
    u.toStream(['s'])
      .pipe(parser)
      .pipe(u.toArray(callback));
  });

});
