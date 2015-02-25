/** @jsx phrase.createElement */
/* eslint-env mocha */
import es from 'event-stream'
import {expect} from 'chai'
import fulltext from 'lacona-util-fulltext'
import * as lacona from '..'
import * as phrase from 'lacona-phrase'

describe('literal', function () {
  var parser

  beforeEach(function () {
    parser = new lacona.Parser()
  })

  it('handles a literal', function (done) {

    function callback (err, data) {
      expect(err).to.not.exist
      expect(data).to.have.length(3)
      expect(data[1].data.suggestion).to.have.length(2)
      expect(data[1].data.suggestion[0].string).to.equal('l')
      expect(data[1].data.suggestion[0].input).to.be.true
      expect(data[1].data.suggestion[1].string).to.equal('iteral test')
      expect(data[1].data.suggestion[1].input).to.be.false
      expect(data[1].data.result).to.be.empty
      done()
    }

    parser.sentences = [<literal text='literal test' />]
    es.readArray(['l'])
      .pipe(parser)
      .pipe(es.writeArray(callback))
  })

  it('handles a literal with an id', function (done) {
    function callback (err, data) {
      expect(err).to.not.exist
      expect(data).to.have.length(3)
      expect(fulltext.suggestion(data[1].data)).to.equal('literal test')
      expect(data[1].data.result).to.equal('test')
      done()
    }

    parser.sentences = [<literal text='literal test' value='test'/>]
    es.readArray(['l'])
      .pipe(parser)
      .pipe(es.writeArray(callback))
  })

  it('maintains case', function (done) {
    function callback (err, data) {
      expect(err).to.not.exist
      expect(data).to.have.length(3)
      expect(fulltext.suggestion(data[1].data)).to.equal('Test')
      done()
    }

    parser.sentences = [<literal text='Test' />]
    es.readArray(['t'])
      .pipe(parser)
      .pipe(es.writeArray(callback))
  })
})
