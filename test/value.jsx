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

describe('value', function () {
  var parser
  beforeEach(function () {
    parser = new lacona.Parser()
  })

  it('suggests a value', function (done) {
    function fun() {
      return [{text: 'tex', value: 'val'}]
    }

    function callback (err, data) {
      expect(err).to.not.exist
      expect(data).to.have.length(3)
      expect(data[1].data.result).to.equal('val')
      expect(fulltext.suggestion(data[1].data)).to.equal('tex')
      done()
    }

    parser.sentences = [<value compute={fun} />]

    es.readArray(['te'])
      .pipe(parser)
      .pipe(es.writeArray(callback))
  })

  it('can access props its function', function (done) {
    var funSpy = spy()

    class Test extends phrase.Phrase {
      fun() {
        expect(this.props.myVar).to.equal('myVal')
        funSpy()
        return []
      }

      describe() {
        return <value compute={this.fun.bind(this)} />
      }
    }

    function callback () {
      expect(funSpy).to.have.been.calledOnce

      done()
    }

    parser.sentences = [<Test myVar='myVal' />]
    es.readArray(['di'])
      .pipe(parser)
      .pipe(es.writeArray(callback))
  })

  it('can override fuzzy settings', function (done) {
    function fun (input, data, done) {
      return [
        {text: 'tst', value: 'non-fuzzy'},
        {text: 'test', value: 'fuzzy'}
      ]
    }

    function callback (err, data) {
      expect(err).to.not.exist
      expect(data).to.have.length(3)
      expect(fulltext.match(data[1].data)).to.equal('tst')
      expect(data[1].data.result).to.equal('non-fuzzy')
      done()
    }

    parser.sentences = [
      <value compute={fun} fuzzy='none' />
    ]
    parser.fuzzy = 'all'
    es.readArray(['tst'])
      .pipe(parser)
      .pipe(es.writeArray(callback))
  })
})
