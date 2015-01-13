var chai = require('chai');
var expect = chai.expect;
var u = require('./util');

describe('Phrase', function () {
  var parser;
  beforeEach(function() {
    parser = new u.lacona.Parser();
  });

  it('handles phrases with extension', function (done) {
    var extended = u.lacona.createPhrase({
      name: 'test/extended',
      describe: function () {
        return u.lacona.literal({text: 'test a'});
      }
    });

    var extender = u.lacona.createPhrase({
      name: 'test/extender',
      extends: ['test/extended'],
      describe: function () {
        return u.lacona.literal({text: 'test b'});
      }
    });

    var test = u.lacona.createPhrase({
      name: 'test/test',
      describe: function () {
        return extended();
      }
    });

    function callback(data) {
      expect(data).to.have.length(4);
      expect(['test a', 'test b']).to.contain(data[1].data.suggestion.words[0].string);
      expect(['test a', 'test b']).to.contain(data[2].data.suggestion.words[0].string);
      done();
    }

    parser.sentences = [test()];
    parser.extensions = [extender];

    u.toStream(['t'])
    .pipe(parser)
    .pipe(u.toArray(callback));
  });

  it('handles phrases with overriding', function (done) {
    var overridden = u.lacona.createPhrase({
      name: 'test/overridden',
      describe: function () {
        return u.lacona.literal({text: 'test a'});
      }
    });

    var overrider = u.lacona.createPhrase({
      name: 'test/overrider',
      overrides: ['test/overridden'],
      describe: function () {
        return u.lacona.literal({text: 'test b'});
      }
    });

    var test = u.lacona.createPhrase({
      name: 'test/test',
      describe: function () {
        return overridden();
      }
    });

    function callback(data) {
      expect(data).to.have.length(3);
      expect(data[1].data.suggestion.words[0].string).to.equal('test b');
      done();
    }

    parser.sentences = [test()];
    parser.extensions = [overrider];

    u.toStream(['t'])
    .pipe(parser)
    .pipe(u.toArray(callback));
  });

  it('allows for recursive phrases without creating an infinite loop', function (done) {
    var test = u.lacona.createPhrase({
      name: 'test/test',
      describe: function () {
        return u.lacona.sequence({children: [
          u.lacona.literal({text: 'na '}),
          u.lacona.choice({children: [
            u.lacona.literal({text: 'nopeman'}),
            test()
          ]})
        ]});
      }
    });

    function callback(data) {
      expect(data).to.have.length(4);
      expect(['na ', 'nopeman']).to.contain(data[1].data.suggestion.words[0].string);
      expect(['na ', 'nopeman']).to.contain(data[2].data.suggestion.words[0].string);
      done();
    }

    parser.sentences = [test()];
    u.toStream(['na n'])
      .pipe(parser)
      .pipe(u.toArray(callback));
  });

  it('allows for nested phrases with the same id', function (done) {
    var test = u.lacona.createPhrase({
      name: 'test/test',
      describe: function () {
        return include1({id: 'test'});
      }
    });
    var include1 = u.lacona.createPhrase({
      name: 'test/include1',
      describe: function () {
        return include2({id: 'test'});
      }
    });
    var include2 = u.lacona.createPhrase({
      name: 'test/include2',
      describe: function () {
        return u.lacona.literal({value: 'val', text: 'disp', id: 'test'});
      }
    });

    function callback(data) {
      expect(data).to.have.length(3);
      expect(data[1].data.suggestion.words[0].string).to.equal('disp');
      expect(data[1].data.result.test.test.test).to.equal('val');
      done();
    }

    parser.sentences = [test()];
    u.toStream(['d'])
      .pipe(parser)
      .pipe(u.toArray(callback));
  });

  it('throws for phrases without a default-lang schema', function () {
    expect(function() {
      u.lacona.createPhrase({
        name: 'test/test',
        translations: [{
          langs: ['en-US'],
          describe: function () {
            return u.lacona.literal({text: 'whatever'});
          }
        }]
      });
    }).to.throw(u.lacona.Error);
  });

  it('throws for translations without a lang', function () {
    expect(function() {
      u.lacona.createPhrase({
        name: 'test/test',
        translations: [{
          describe: function () {
            return u.lacona.literal({text: 'whatever'});
          }
        }]
      });
    }).to.throw(u.lacona.Error);
  });

  it('throws for phrases without a root', function () {
    expect(function() {
      u.lacona.createPhrase({
        name: 'test/test'
      });
    }).to.throw(u.lacona.Error);
  });

  it('throws for phrases without a name', function () {
    expect(function() {
      u.lacona.createPhrase({
        describe: function() {
          return u.lacona.literal({text: 'test'});
        }
      });
    }).to.throw(u.lacona.Error);
  });

});
