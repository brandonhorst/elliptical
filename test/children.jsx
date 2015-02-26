/** @jsx phrase.createElement */
/* eslint-env mocha */
import es from 'event-stream'
import {expect} from 'chai'
import fulltext from 'lacona-util-fulltext'
import * as lacona from '..'
import * as phrase from 'lacona-phrase'

describe('children', function () {
  var parser

  beforeEach(function () {
    parser = new lacona.Parser()
  })

  it('passes children as props', function (done) {
    class Test extends phrase.Phrase {
      describe() {
        expect(this.props.children).to.have.length(2)
        return this.props.children[1]
      }
    }

    function callback(err, data) {
      expect(err).to.not.exist
      expect(data).to.have.length(3)
      expect(fulltext.suggestion(data[1].data)).to.equal('b')
      done()
    }

    parser.sentences = [
      <Test>
        <literal text='a' />
        <literal text='b' />
      </Test>
    ]
    es.readArray([''])
      .pipe(parser)
      .pipe(es.writeArray(callback))
  })

  it('flattens children as props', function (done) {
    class Test extends phrase.Phrase {
      describe() {
        expect(this.props.children).to.have.length(3)
        return this.props.children[1]
      }
    }

    function callback(err, data) {
      expect(err).to.not.exist
      expect(data).to.have.length(3)
      expect(fulltext.suggestion(data[1].data)).to.equal('b')
      done()
    }

    const literals = [<literal text='b' />, <literal text='c' />]
    parser.sentences = [
      <Test>
        <literal text='a' />
        {literals}
      </Test>
    ]
    es.readArray([''])
      .pipe(parser)
      .pipe(es.writeArray(callback))
  })

  it('passes the child id for use in getValue', function (done) {
    class Test extends phrase.Phrase {
      describe() {
        return this.props.children[0]
      }
      getValue(result) {
        expect(result[this.props.children[0].props.id]).to.equal('b')
        return 'something'
      }
    }

    function callback(err, data) {
      expect(err).to.not.exist
      expect(data).to.have.length(3)
      expect(fulltext.suggestion(data[1].data)).to.equal('a')
      expect(data[1].data.result).to.equal('something')
      done()
    }

    parser.sentences = [
      <Test>
        <literal text='a' value='b' />
      </Test>
    ]
    es.readArray([''])
      .pipe(parser)
      .pipe(es.writeArray(callback))
  })
})
