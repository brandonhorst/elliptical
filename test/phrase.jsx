/** @jsx phrase.createElement */
/* eslint-env mocha */
import chai, {expect} from 'chai'
import es from 'event-stream'
import fulltext from 'lacona-util-fulltext'
import * as lacona from '..'
import * as phrase from 'lacona-phrase'
import Phrase from '../lib/phrase'
import {spy} from 'sinon'
import sinonChai from 'sinon-chai'
import stream from 'stream'

chai.use(sinonChai)

describe('Phrase', function () {
  var parser
  beforeEach(function () {
    parser = new lacona.Parser()
  })

  it('handles phrases with supplements', function (done) {
    class Extended extends phrase.Phrase {
      describe() { return <literal text='test a' /> }
    }

    class Extender extends phrase.Phrase {
      describe() { return <literal text='test b' /> }
    }
    Extender.supplements = [Extended]

    function callback (err, data) {
      expect(err).to.not.exist
      expect(data).to.have.length(4)
      expect(fulltext.suggestion(data[1].data)).to.equal('test b')
      expect(fulltext.suggestion(data[2].data)).to.equal('test a')
      done()
    }

    parser.sentences = [<Extended />]
    parser.extensions = [Extender]

    es.readArray(['t'])
      .pipe(parser)
      .pipe(es.writeArray(callback))
  })

  it('accepts supplements being removed', function (done) {
    var callbackSpy = spy()

    class Extended extends phrase.Phrase {
      describe() { return <literal text='test a' /> }
    }

    class Extender extends phrase.Phrase {
      describe() { return <literal text='test b' /> }
    }
    Extender.supplements = [Extended]

    var start = new stream.Readable({objectMode: true})
    var end = new stream.Writable({objectMode: true})
    start._read = function noop () {}
    end.write = function (obj) {
      if (obj.event === 'data') {
        callbackSpy()
        if (callbackSpy.calledOnce) {
          expect(fulltext.all(obj.data)).to.equal('test b')
        } else if (callbackSpy.calledTwice) {
          expect(fulltext.all(obj.data)).to.equal('test a')
          parser.extensions = []
          start.push('t')
          start.push(null)
        } else {
          expect(fulltext.all(obj.data)).to.equal('test a')
          done()
        }
      }
    }

    parser.sentences = [<Extended />]
    parser.extensions = [Extender]

    start.pipe(parser).pipe(end)
    start.push('t')
  })

  it('handles phrases with overriding', function (done) {
    class Overridden extends phrase.Phrase {
      describe() { return <literal text='test a' /> }
    }
    class Overrider extends phrase.Phrase {
      describe() { return <literal text='test b' /> }
    }
    Overrider.overrides = [Overridden]

    function callback (err, data) {
      expect(err).to.not.exist
      expect(data).to.have.length(3)
      expect(fulltext.suggestion(data[1].data)).to.equal('test b')
      done()
    }

    parser.sentences = [<Overridden />]
    parser.extensions = [Overrider]

    es.readArray(['t'])
    .pipe(parser)
    .pipe(es.writeArray(callback))
  })

  it('allows for recursive phrases without creating an infinite loop', function (done) {
    class Test extends phrase.Phrase {
      describe() {
        return (
          <sequence>
            <literal text='na' />
            <choice>
              <literal text='nopeman' />
              <Test />
            </choice>
          </sequence>
        )
      }
    }

    function callback (err, data) {
      expect(err).to.not.exist
      expect(data).to.have.length(4)
      expect(fulltext.match(data[1].data)).to.equal('na')
      expect(fulltext.suggestion(data[1].data)).to.equal('nopeman')
      expect(fulltext.match(data[2].data)).to.equal('na')
      expect(fulltext.suggestion(data[2].data)).to.equal('na')
      done()
    }

    parser.sentences = [<Test />]
    es.readArray(['nan'])
      .pipe(parser)
      .pipe(es.writeArray(callback))
  })

  it('allows for nested phrases with the same id', function (done) {
    class Test extends phrase.Phrase {
      describe() { return <Include1 id='test' /> }
    }
    class Include1 extends phrase.Phrase {
      describe() { return <Include2 id='test' /> }
    }
    class Include2 extends phrase.Phrase {
      describe() { return <literal text='disp' value='val' id='test' /> }
    }

    function callback (err, data) {
      expect(err).to.not.exist
      expect(data).to.have.length(3)
      expect(fulltext.suggestion(data[1].data)).to.equal('disp')
      expect(data[1].data.result.test.test.test).to.equal('val')
      done()
    }

    parser.sentences = [<Test />]
    es.readArray(['d'])
      .pipe(parser)
      .pipe(es.writeArray(callback))
  })

  it('calls getValue when on the Phrase context', function (done) {
    const getVal = spy()
    class Test extends phrase.Phrase {
      getValue(result) {
        getVal()
        expect(this.props.test).to.equal('myProp')
        expect(result).to.eql({myId: 'myVal'})
      }
      describe() { return <literal id='myId' value='myVal' text='test' /> }
    }

    function callback(err, data) {
      expect(err).to.not.exist
      expect(data).to.have.length(3)
      expect(getVal).to.have.been.calledOnce
      done()
    }

    parser.sentences = [<Test test='myProp' />]
    es.readArray(['t'])
      .pipe(parser)
      .pipe(es.writeArray(callback))
  })

  it('sentence passes on result if getValue was not supplied', function (done) {
    const getVal = spy()
    class Test extends phrase.Phrase {
      describe() { return <literal id='myId' value='myVal' text='test' /> }
    }

    function callback(err, data) {
      expect(err).to.not.exist
      expect(data).to.have.length(3)
      expect(data[1].data.result).to.eql({myId: 'myVal'})
      done()
    }

    parser.sentences = [<Test test='myProp' />]
    es.readArray(['t'])
      .pipe(parser)
      .pipe(es.writeArray(callback))
  })

  it('caches calls to describe', function (done) {
    var callbackSpy = spy()
    var describeSpy = spy()

    class Test extends phrase.Phrase {
      describe() {
        describeSpy()
        return <literal text='test' />
      }
    }

    var start = new stream.Readable({objectMode: true})
    var end = new stream.Writable({objectMode: true})
    start._read = function noop () {}
    end.write = function (obj) {
      if (obj.event === 'data') {
        callbackSpy()
        if (callbackSpy.calledOnce) {
          start.push('t')
          start.push(null)
        } else {
          expect(describeSpy).to.have.been.calledOnce
          done()
        }
      }
    }

    parser.sentences = [<Test />]

    start.pipe(parser).pipe(end)
    start.push('t')
  })

  it('throws for phrases without a default-lang schema', function () {
    class Test extends phrase.Phrase {
      getTranslations() {
        return [{
          langs: ['en-US'],
          describe: function () {
            return lacona.literal({text: 'whatever'})
          }
        }]
      }
    }

    expect(function () {
      new Phrase(<Test />)
    }).to.throw(lacona.Error)
  })

  it('throws for translations without a lang', function () {
    class Test extends phrase.Phrase {
      getTranslations() {
        return [{
          describe: function () {
            return lacona.literal({text: 'whatever'})
          }
        }]
      }
    }

    expect(function () {
      new Phrase(<Test />)
    }).to.throw(lacona.Error)
  })

  it('throws for phrases without a describe', function () {
    class Test extends phrase.Phrase {}
    
    expect(function () {
      new Phrase(<Test />)
    }).to.throw(lacona.Error)
  })
})
