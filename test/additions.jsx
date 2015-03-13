/** @jsx phrase.createElement */
/* eslint-env mocha */
import chai, {expect} from 'chai'
import es from 'event-stream'
import fulltext from 'lacona-util-fulltext'
import * as lacona from '..'
import * as phrase from 'lacona-phrase'
import sinonChai from 'sinon-chai'
import {spy} from 'sinon'
import stream from 'stream'

chai.use(sinonChai)

describe('additions', () => {
  let parser
  beforeEach(function () {
    parser = new lacona.Parser()
  })

  it('allows phrases to have additions (but not passed to constructor)', function (done) {
    class Test extends phrase.Phrase {
      constructor() {
        expect(this.config).to.be.undefined
      }
      describe() {
        expect(this.config).to.equal('test')
        done()
        return <literal /> // whatever
      }
    }
    Test.setAdditions({config: 'test'})

    parser.sentences = [<Test />]

    es.readArray(['']).pipe(parser)
  })

  it('allows initialAdditions', function (done) {
    class Test extends phrase.Phrase {
      describe() {
        expect(this.config).to.equal('test')
        done()
        return <literal /> // whatever
      }

      static get initialAdditions() {return {config: 'test'}}
    }

    parser.sentences = [<Test />]

    es.readArray(['']).pipe(parser)
  })

  it('changing additions clears the describe cache', function (done) {
    var callbackSpy = spy()
    var describeSpy = spy()

    class Test extends phrase.Phrase {
      describe() {
        describeSpy()
        if (!callbackSpy.called) {
          expect(this.config).to.be.undefined
        } else {
          expect(this.config).to.equal('test')
        }
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
          Test.setAdditions({config: 'test'})
          start.push('t')
          start.push(null)
        } else {
          expect(describeSpy).to.have.been.calledTwice
          done()
        }
      }
    }

    parser.sentences = [<Test />]

    start.pipe(parser).pipe(end)
    start.push('t')
  })

  it('can remove additions', function (done) {
    var callbackSpy = spy()
    var describeSpy = spy()

    class Test extends phrase.Phrase {
      describe() {
        describeSpy()
        if (!callbackSpy.called) {
          expect(this.config).to.equal('test')
        } else {
          expect(this.config).to.be.undefined
        }
        return <literal text='test' />
      }

      static get initialAdditions() {
        return {config: 'test'}
      }
    }

    var start = new stream.Readable({objectMode: true})
    var end = new stream.Writable({objectMode: true})
    start._read = function noop () {}
    end.write = function (obj) {
      if (obj.event === 'data') {
        callbackSpy()
        if (callbackSpy.calledOnce) {
          Test.setAdditions({})
          start.push('t')
          start.push(null)
        } else {
          expect(describeSpy).to.have.been.calledTwice
          done()
        }
      }
    }

    parser.sentences = [<Test />]

    start.pipe(parser).pipe(end)
    start.push('t')
  })

  // it('allows phrases to modify set their additions, and it calls additionsCallback', function (done) {
  //   class Test extends phrase.Phrase {
  //     changeConfig() {
  //       this.setConfig('new test')
  //     }
  //
  //     describe() {
  //       expect(this.config).to.equal('test')
  //       this.changeConfig()
  //
  //       return <literal />
  //     }
  //
  //     static additionsCallback(newAdditions) {
  //       expect(newAdditions.config).to.equal('new test')
  //       done()
  //     }
  //   }
  //   Test.setAdditions({config: 'test'})
  //
  //   parser.sentences = [<Test />]
  //
  //   es.readArray(['']).pipe(parser)
  // })

  it('allows extensions to keep their additions', function (done) {
    class Test extends phrase.Phrase {
      describe() {
        return <literal text='test' />
      }
    }

    class Extender extends phrase.Phrase {
      describe() {
        expect(this.config).to.equal('test')
        done()
        return <literal />
      }
    }
    Extender.supplements = [Test]
    Extender.setAdditions({config: 'test'})

    parser.sentences = [<Test />]
    parser.extensions = [Extender]

    es.readArray(['']).pipe(parser)
  })
})
