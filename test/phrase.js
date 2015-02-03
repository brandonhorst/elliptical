var chai = require('chai');
var expect = chai.expect;
var sinon = require('sinon');
var u = require('./util');
var Readable = require('stream').Readable;
var Writable = require('stream').Writable;

chai.use(require('sinon-chai'));

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
      expect(u.ft.suggestion(data[1].data)).to.equal('test b');
      expect(u.ft.suggestion(data[2].data)).to.equal('test a');
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
      expect(u.ft.suggestion(data[1].data)).to.equal('test b');
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
      expect(u.ft.match(data[1].data)).to.equal('na ');
      expect(u.ft.suggestion(data[1].data)).to.equal('nopeman');
      expect(u.ft.match(data[2].data)).to.equal('na ');
      expect(u.ft.suggestion(data[2].data)).to.equal('na ');
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
      expect(u.ft.suggestion(data[1].data)).to.equal('disp');
      expect(data[1].data.result.test.test.test).to.equal('val');
      done();
    }

    parser.sentences = [test()];
    u.toStream(['d'])
      .pipe(parser)
      .pipe(u.toArray(callback));
  });

  it('caches calls to describe', function (done) {
    var callbackSpy = sinon.spy();
    var describeSpy = sinon.spy();

    var test = u.lacona.createPhrase({
      name: 'test/test',
      describe: function () {
        describeSpy();
        return u.lacona.literal({text: 'test'});
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

    var test = u.lacona.createPhrase({
      name: 'test/test',
      describe: function () {
        describeSpy();
        return u.lacona.literal({text: 'test'});
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
    var test = u.lacona.createPhrase({
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
