var chai = require('chai');
var es = require('event-stream');
var expect = chai.expect;
var fulltext = require('lacona-util-fulltext');
var lacona = require('..');
var Readable = require('stream').Readable;
var sinon = require('sinon');
var Writable = require('stream').Writable;

chai.use(require('sinon-chai'));

describe('Phrase', function () {
  var parser;
  beforeEach(function() {
    parser = new lacona.Parser();
  });

  it('handles phrases with extension', function (done) {
    var extended = lacona.createPhrase({
      name: 'test/extended',
      describe: function () {
        return lacona.literal({text: 'test a'});
      }
    });

    var extender = lacona.createPhrase({
      name: 'test/extender',
      extends: ['test/extended'],
      describe: function () {
        return lacona.literal({text: 'test b'});
      }
    });

    var test = lacona.createPhrase({
      name: 'test/test',
      describe: function () {
        return extended();
      }
    });

    function callback(err, data) {
      expect(data).to.have.length(4);
      expect(fulltext.suggestion(data[1].data)).to.equal('test b');
      expect(fulltext.suggestion(data[2].data)).to.equal('test a');
      done();
    }

    parser.sentences = [test()];
    parser.extensions = [extender];

    es.readArray(['t'])
    .pipe(parser)
    .pipe(es.writeArray(callback));
  });

  it('handles phrases with overriding', function (done) {
    var overridden = lacona.createPhrase({
      name: 'test/overridden',
      describe: function () {
        return lacona.literal({text: 'test a'});
      }
    });

    var overrider = lacona.createPhrase({
      name: 'test/overrider',
      overrides: ['test/overridden'],
      describe: function () {
        return lacona.literal({text: 'test b'});
      }
    });

    var test = lacona.createPhrase({
      name: 'test/test',
      describe: function () {
        return overridden();
      }
    });

    function callback(err, data) {
      expect(data).to.have.length(3);
      expect(fulltext.suggestion(data[1].data)).to.equal('test b');
      done();
    }

    parser.sentences = [test()];
    parser.extensions = [overrider];

    es.readArray(['t'])
    .pipe(parser)
    .pipe(es.writeArray(callback));
  });

  it('allows for recursive phrases without creating an infinite loop', function (done) {
    var test = lacona.createPhrase({
      name: 'test/test',
      describe: function () {
        return lacona.sequence({children: [
          lacona.literal({text: 'na '}),
          lacona.choice({children: [
            lacona.literal({text: 'nopeman'}),
            test()
          ]})
        ]});
      }
    });

    function callback(err, data) {
      expect(data).to.have.length(4);
      expect(fulltext.match(data[1].data)).to.equal('na ');
      expect(fulltext.suggestion(data[1].data)).to.equal('nopeman');
      expect(fulltext.match(data[2].data)).to.equal('na ');
      expect(fulltext.suggestion(data[2].data)).to.equal('na ');
      done();
    }

    parser.sentences = [test()];
    es.readArray(['na n'])
      .pipe(parser)
      .pipe(es.writeArray(callback));
  });

  it('allows for nested phrases with the same id', function (done) {
    var test = lacona.createPhrase({
      name: 'test/test',
      describe: function () {
        return include1({id: 'test'});
      }
    });
    var include1 = lacona.createPhrase({
      name: 'test/include1',
      describe: function () {
        return include2({id: 'test'});
      }
    });
    var include2 = lacona.createPhrase({
      name: 'test/include2',
      describe: function () {
        return lacona.literal({value: 'val', text: 'disp', id: 'test'});
      }
    });

    function callback(err, data) {
      expect(data).to.have.length(3);
      expect(fulltext.suggestion(data[1].data)).to.equal('disp');
      expect(data[1].data.result.test.test.test).to.equal('val');
      done();
    }

    parser.sentences = [test()];
    es.readArray(['d'])
      .pipe(parser)
      .pipe(es.writeArray(callback));
  });

  it('caches calls to describe', function (done) {
    var callbackSpy = sinon.spy();
    var describeSpy = sinon.spy();

    var test = lacona.createPhrase({
      name: 'test/test',
      describe: function () {
        describeSpy();
        return lacona.literal({text: 'test'});
      }
    });

    var start = new Readable({objectMode: true});
    var end = new Writable({objectMode: true});
    start._read = function noop() {};
    end.write = function (obj) {
      if (obj.event === 'data') {
        callbackSpy();
        if (callbackSpy.calledOnce) {
          start.push('t');
          start.push(null);
        } else {
          expect(describeSpy).to.have.been.calledOnce;
          done();
        }
      }
    };

    parser.sentences = [test()];

    start.pipe(parser).pipe(end);
    start.push('t');
  });

  it('can clear the describe cache', function (done) {
    var callbackSpy = sinon.spy();
    var describeSpy = sinon.spy();

    var test = lacona.createPhrase({
      name: 'test/test',
      describe: function () {
        describeSpy();
        return lacona.literal({text: 'test'});
      }
    });

    var start = new Readable({objectMode: true});
    var end = new Writable({objectMode: true});
    start._read = function noop() {};
    end.write = function (obj) {
      if (obj.event === 'data') {
        callbackSpy();
        if (callbackSpy.calledOnce) {
          parser.sentences[0]._clearDescribeCache();
          start.push('t');
          start.push(null);
        } else {
          expect(describeSpy).to.have.been.calledTwice;
          done();
        }
      }
    };

    parser.sentences = [test()];

    start.pipe(parser).pipe(end);
    start.push('t');
  });

  it('allows phrases to have additions', function (done) {
    var test = lacona.createPhrase({
      name: 'test/test',
      onCreate: function () {
        expect(this.config).to.equal('test');
        done();
      },
      describe: function () {}
    });

    test.additions = {config: 'test'};

    test();
  });

  it('allows extensions to keep their additions', function (done) {
    var test = lacona.createPhrase({
      name: 'test/test',
      describe: function () {
        return lacona.literal({text: 'test'});
      }
    });

    var extender = lacona.createPhrase({
      name: 'test/extender',
      extends: 'test/test',
      describe: function () {
        expect(this.config).to.equal('test');
        return lacona.literal({text: 'ext'});
      }
    });

    function callback(err, data) {
      expect(data).to.have.length(3);
      expect(fulltext.all(data[1].data)).to.equal('ext');
      done();
    }

    extender.additions = {config: 'test'};

    parser.sentences = [test()];
    parser.extensions = [extender];

    es.readArray(['e'])
      .pipe(parser)
      .pipe(es.writeArray(callback));

  });

  it('throws for phrases without a default-lang schema', function () {
    expect(function() {
      lacona.createPhrase({
        name: 'test/test',
        translations: [{
          langs: ['en-US'],
          describe: function () {
            return lacona.literal({text: 'whatever'});
          }
        }]
      });
    }).to.throw(lacona.Error);
  });

  it('throws for translations without a lang', function () {
    expect(function() {
      lacona.createPhrase({
        name: 'test/test',
        translations: [{
          describe: function () {
            return lacona.literal({text: 'whatever'});
          }
        }]
      });
    }).to.throw(lacona.Error);
  });

  it('throws for phrases without a root', function () {
    expect(function() {
      lacona.createPhrase({
        name: 'test/test'
      });
    }).to.throw(lacona.Error);
  });

  it('throws for phrases without a name', function () {
    expect(function() {
      lacona.createPhrase({
        describe: function() {
          return lacona.literal({text: 'test'});
        }
      });
    }).to.throw(lacona.Error);
  });

});
