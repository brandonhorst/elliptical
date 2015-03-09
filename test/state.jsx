/** @jsx phrase.createElement */
/* eslint-env mocha */
import {expect} from 'chai'
import es from 'event-stream'
import fulltext from 'lacona-util-fulltext'
import * as lacona from '..'
import * as phrase from 'lacona-phrase'

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
})
