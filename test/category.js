var chai = require('chai');
var es = require('event-stream');
var expect = chai.expect;
var fulltext = require('lacona-util-fulltext');
var lacona = require('..');

describe('category', function () {
  var parser;

  beforeEach(function() {
    parser = new lacona.Parser();
  });

  it('passes a category to the OutputOption', function (done) {
    var test = lacona.createPhrase({
      name: 'test/test',
      describe: function () {
        return lacona.literal({text: 'test', category: 'myCat'});
      }
    });

    function callback(err, data) {
      expect(data).to.have.length(3);
      expect(fulltext.suggestion(data[1].data)).to.equal('test');
      expect(data[1].data.suggestion[0].category).to.equal('myCat');
      done();
    }

    parser.sentences = [test()];
    es.readArray(['t'])
    .pipe(parser)
    .pipe(es.writeArray(callback));
  });

  it('custom phrases can modify the category', function (done) {
    var test = lacona.createPhrase({
      name: 'test/test',
      describe: function () {
        return dep({category: 'myCat'});
      }
    });

    var dep = lacona.createPhrase({
      name: 'test/dep',
      describe: function () {
        return lacona.literal({
          text: 'test',
          category: this.props.category + 'Modified'
        });
      }
    });

    function callback(err, data) {
      expect(data).to.have.length(3);
      expect(fulltext.suggestion(data[1].data)).to.equal('test');
      expect(data[1].data.suggestion[0].category).to.equal('myCatModified');
      done();
    }

    parser.sentences = [test()];
    es.readArray(['t'])
      .pipe(parser)
      .pipe(es.writeArray(callback));
  });

  it('custom phrases will inherit the category if none is specified', function (done) {
    var test = lacona.createPhrase({
      name: 'test/test',
      describe: function () {
        return dep({category: 'myCat'});
      }
    });

    var dep = lacona.createPhrase({
      name: 'test/dep',
      describe: function () {
        return lacona.literal({
          text: 'test'
        });
      }
    });

    function callback(err, data) {
      expect(data).to.have.length(3);
      expect(fulltext.suggestion(data[1].data)).to.equal('test');
      expect(data[1].data.suggestion[0].category).to.equal('myCat');
      done();
    }

    parser.sentences = [test()];
    es.readArray(['t'])
      .pipe(parser)
      .pipe(es.writeArray(callback));
  });
});
