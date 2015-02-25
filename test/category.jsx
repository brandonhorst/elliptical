/** @jsx phrase.createElement */
/* eslint-env mocha */
import es from 'event-stream'
import {expect} from 'chai'
import fulltext from 'lacona-util-fulltext'
import * as lacona from '..'
import * as phrase from 'lacona-phrase'

describe('category', function () {
  var parser

  beforeEach(function () {
    parser = new lacona.Parser()
  })

  it('passes a category to the OutputOption', function (done) {
    function callback (err, data) {
      expect(err).to.not.exist
      expect(data).to.have.length(3)
      expect(data[1].data.suggestion[0].category).to.equal('myCat')
      done()
    }

    parser.sentences = [<literal text='test' category='myCat' />]
    es.readArray(['t'])
      .pipe(parser)
      .pipe(es.writeArray(callback))
  })

  it('custom phrases can modify the category', function (done) {
    class Test extends phrase.Phrase {
      describe() {
        return <literal text='test' category={this.props.category + 'Modified'} />
      }
    }

    function callback (err, data) {
      expect(err).to.not.exist
      expect(data).to.have.length(3)
      expect(data[1].data.suggestion[0].category).to.equal('myCatModified')
      done()
    }

    parser.sentences = [<Test category='myCat' />]
    es.readArray(['t'])
      .pipe(parser)
      .pipe(es.writeArray(callback))
  })

  it('custom phrases will inherit the category if none is specified', function (done) {
    class Test extends phrase.Phrase {
      describe() {
        return <literal text='test' />
      }
    }

    function callback (err, data) {
      expect(err).to.not.exist
      expect(data).to.have.length(3)
      expect(data[1].data.suggestion[0].category).to.equal('myCat')
      done()
    }

    parser.sentences = [<Test category='myCat' />]
    es.readArray(['t'])
      .pipe(parser)
      .pipe(es.writeArray(callback))
  })
})
