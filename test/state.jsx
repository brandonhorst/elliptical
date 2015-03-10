/** @jsx phrase.createElement */
/* eslint-env mocha */
import chai, {expect} from 'chai'
import es from 'event-stream'
import fulltext from 'lacona-util-fulltext'
import * as lacona from '..'
import * as phrase from 'lacona-phrase'
import sinonChai from 'sinon-chai'
import {spy} from 'sinon'

chai.use(sinonChai)

describe('state', () => {
  let parser
  beforeEach(function () {
    parser = new lacona.Parser()
  })

  it('allows for initialState', function (done) {
    class Test extends phrase.Phrase {
      static get initialState() {
        return 'test'
      }

      describe() {
        return <literal text={this.state} />
      }
    }

    function callback(err, data) {
      expect(err).to.not.exist
      expect(data).to.have.length(3)
      expect(fulltext.all(data[1].data)).to.equal('test')
      done()
    }

    parser.sentences = [<Test />]
    es.readArray([''])
      .pipe(parser)
      .pipe(es.writeArray(callback))
  })

  it('allows Phrases to setState', function (done) {
    class Test extends phrase.Phrase {
      constructor() {
        this.setState('test')
      }

      describe() {
        return <literal text={this.state} />
      }
    }

    function callback(err, data) {
      expect(err).to.not.exist
      expect(data).to.have.length(3)
      expect(fulltext.all(data[1].data)).to.equal('test')
      done()
    }

    parser.sentences = [<Test />]
    es.readArray([''])
      .pipe(parser)
      .pipe(es.writeArray(callback))
  })

  it('allows changes to state to redescribe', function (done) {
    class Test extends phrase.Phrase {
      static get initialState() {
        return 'first'
      }

      describe() {
        const x = <literal text={this.state} />
        this.setState('second')
        return x
      }
    }

    function callback(err, data) {
      expect(err).to.not.exist
      expect(data).to.have.length(6)
      expect(fulltext.all(data[1].data)).to.equal('first')
      expect(fulltext.all(data[4].data)).to.equal('second')
      done()
    }

    parser.sentences = [<Test />]
    es.readArray(['', ''])
      .pipe(parser)
      .pipe(es.writeArray(callback))
  })

  it('redescriptions do not recreate entire Phrase', function (done) {
    const consSpy = spy()
    class Test extends phrase.Phrase {
      constructor() { consSpy() }

      static get initialState() {
        return 'first'
      }

      describe() {
        const x = <literal text={this.state} />
        this.setState('second')
        return x
      }
    }

    function callback(err, data) {
      expect(err).to.not.exist
      expect(data).to.have.length(6)
      expect(fulltext.all(data[1].data)).to.equal('first')
      expect(fulltext.all(data[4].data)).to.equal('second')
      expect(consSpy).to.have.been.calledOnce
      done()
    }

    parser.sentences = [<Test />]
    es.readArray(['', ''])
      .pipe(parser)
      .pipe(es.writeArray(callback))
  })

  it('nested redescriptions do not recreate entire Phrase', function (done) {
    const consSpy = spy()
    const subConsSpy = spy()

    class SubTest extends phrase.Phrase {
      constructor() { subConsSpy('sub') }
      describe() { return <literal text={this.props.val} /> }
    }

    class Test extends phrase.Phrase {
      constructor() { consSpy('main') }

      static get initialState() { return 'first' }

      describe() {
        const x = <SubTest val={this.state} />
        this.setState('second')
        return x
      }
    }

    function callback(err, data) {
      expect(err).to.not.exist
      expect(data).to.have.length(6)
      expect(fulltext.all(data[1].data)).to.equal('first')
      expect(fulltext.all(data[4].data)).to.equal('second')
      expect(consSpy).to.have.been.calledOnce
      expect(subConsSpy).to.have.been.calledOnce
      done()
    }

    parser.sentences = [<Test />]
    es.readArray(['', ''])
      .pipe(parser)
      .pipe(es.writeArray(callback))
  })
})
