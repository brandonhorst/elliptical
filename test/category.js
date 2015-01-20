var chai = require('chai');
var expect = chai.expect;
var u = require('./util');

describe('category', function () {
  var parser;

  beforeEach(function() {
    parser = new u.lacona.Parser();
  });

  it('passes a category to the OutputOption', function (done) {
    var test = u.lacona.createPhrase({
      name: 'test/test',
      describe: function () {
        return u.lacona.literal({text: 'test', category: 'myCat'});
      }
    });

    function callback(data) {
      expect(data).to.have.length(3);
      expect(u.ft.suggestion(data[1].data)).to.equal('test');
      expect(data[1].data.suggestion[0].category).to.equal('myCat');
      done();
    }

    parser.sentences = [test()];
    u.toStream(['t'])
    .pipe(parser)
    .pipe(u.toArray(callback));
  });

  it('custom phrases can modify the category', function (done) {
    var test = u.lacona.createPhrase({
      name: 'test/test',
      describe: function () {
        return dep({category: 'myCat'});
      }
    });

    var dep = u.lacona.createPhrase({
      name: 'test/dep',
      describe: function () {
        return u.lacona.literal({
          text: 'test',
          category: this.props.category + 'Modified'
        });
      }
    });

    function callback(data) {
      expect(data).to.have.length(3);
      expect(u.ft.suggestion(data[1].data)).to.equal('test');
      expect(data[1].data.suggestion[0].category).to.equal('myCatModified');
      done();
    }

    parser.sentences = [test()];
    u.toStream(['t'])
      .pipe(parser)
      .pipe(u.toArray(callback));
  });

  it('custom phrases will inherit the category if none is specified', function (done) {
    var test = u.lacona.createPhrase({
      name: 'test/test',
      describe: function () {
        return dep({category: 'myCat'});
      }
    });

    var dep = u.lacona.createPhrase({
      name: 'test/dep',
      describe: function () {
        return u.lacona.literal({
          text: 'test'
        });
      }
    });

    function callback(data) {
      expect(data).to.have.length(3);
      expect(u.ft.suggestion(data[1].data)).to.equal('test');
      expect(data[1].data.suggestion[0].category).to.equal('myCat');
      done();
    }

    parser.sentences = [test()];
    u.toStream(['t'])
      .pipe(parser)
      .pipe(u.toArray(callback));
  });
});
