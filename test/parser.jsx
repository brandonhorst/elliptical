/** @jsx phrase.createElement */
/* eslint-env mocha */
import chai, {expect} from 'chai'
import es from 'event-stream'
import fulltext from 'lacona-util-fulltext'
import * as lacona from '..'
import Literal from '../lib/elements/literal'
import * as phrase from 'lacona-phrase'
import sinonChai from 'sinon-chai'
import {spy} from 'sinon'

chai.use(sinonChai)

describe('Parser', function () {
  var parser
  beforeEach(function () {
    parser = new lacona.Parser()
  })

  it('passes start and end for sync parse', function (done) {
    function callback (err, data) {
      expect(err).to.not.exist
      expect(data).to.have.length(2)
      expect(data[0].event).to.equal('start')
      expect(data[1].event).to.equal('end')
      done()
    }

    es.readArray(['test'])
      .pipe(parser)
      .pipe(es.writeArray(callback))
  })

  it('requires string input', function (done) {
    var callback = spy(function (err) {
      expect(err).to.be.an.instanceof(Error)
      done()
    })

    es.readArray([123])
      .pipe(parser)
      .on('error', callback)
  })
  //
  // it('allows object input if it has a data property', function (done) {
  //   function callback (err, data) {
  //     expect(err).to.not.exist
  //     expect(data).to.have.length(2)
  //     expect(data[0].event).to.equal('start')
  //     expect(data[1].event).to.equal('end')
  //     done()
  //   }
  //
  //   es.readArray([{data: 'test'}])
  //     .pipe(parser)
  //     .pipe(es.writeArray(callback))
  // })

  // it('passes a given group', function (done) {
  //   function callback (err, data) {
  //     expect(err).to.not.exist
  //     expect(data).to.have.length(3)
  //     expect(data[0].event).to.equal('start')
  //     expect(data[0].group).to.equal('someGroup')
  //     expect(data[1].event).to.equal('data')
  //     expect(data[1].group).to.equal('someGroup')
  //     expect(data[2].event).to.equal('end')
  //     expect(data[2].group).to.equal('someGroup')
  //     done()
  //   }
  //
  //   parser.sentences = [<literal text='test' />]
  //   es.readArray([{group: 'someGroup', data: 'test'}])
  //     .pipe(parser)
  //     .pipe(es.writeArray(callback))
  // })
  //
  // it('parses have separate ids', function (done) {
  //   function callback (err, data) {
  //     expect(err).to.not.exist
  //     expect(data).to.have.length(6)
  //     expect(data[0].event).to.equal('start')
  //     expect(data[2].event).to.equal('end')
  //     expect(data[3].event).to.equal('start')
  //     expect(data[5].event).to.equal('end')
  //     expect(data[1].id).to.equal(data[0].id)
  //     expect(data[1].id).to.equal(data[2].id)
  //     expect(data[4].id).to.equal(data[3].id)
  //     expect(data[4].id).to.equal(data[5].id)
  //     expect(data[1].id).to.be.below(data[4].id)
  //     done()
  //   }
  //
  //   parser.sentences = [<literal text='test' />]
  //   es.readArray(['t', 't'])
  //     .pipe(parser)
  //     .pipe(es.writeArray(callback))
  // })

  it('passes the sentence to the output', function (done) {
    const lit = <literal text='test' />

    function callback (err, data) {
      expect(err).to.not.exist
      expect(data).to.have.length(3)
      expect(data[1].data.sentence).to.be.an.instanceof(Literal)
      done()
    }

    parser.sentences = [lit]
    es.readArray(['t'])
      .pipe(parser)
      .pipe(es.writeArray(callback))
  })

  it('can parse in a specified language', function (done) {
    class Test extends phrase.Phrase {
      static get translations() {
        return [{
          langs: ['en', 'default'],
          describe() {
            return <literal text='test' />
          }
        }, {
          langs: ['es'],
          describe() {
            return <literal text='prueba' />
          }
        }]
      }
    }

    function callback (err, data) {
      expect(err).to.not.exist
      expect(data).to.have.length(3)
      expect(fulltext.suggestion(data[1].data)).to.equal('prueba')
      done()
    }

    parser.langs = ['es']
    parser.sentences = [<Test />]

    es.readArray(['p'])
      .pipe(parser)
      .pipe(es.writeArray(callback))
  })

  it('falls back on a less specific language if a more specific one is not provided', function (done) {
    class Test extends phrase.Phrase {
      static get translations() {
        return [{
          langs: ['en', 'default'],
          describe() {
            return <literal text='train' />
          }
        }, {
          langs: ['es'],
          describe() {
            return <literal text='tren' />
          }
        }]
      }
    }

    function callback (err, data) {
      expect(err).to.not.exist
      expect(data).to.have.length(3)
      expect(fulltext.suggestion(data[1].data)).to.equal('tren')
      done()
    }

    parser.langs = ['es_ES', 'es']

    parser.sentences = [<Test />]
    es.readArray(['tr'])
      .pipe(parser)
      .pipe(es.writeArray(callback))
  })

  // describe('async parse', function () {
  //   class Test extends phrase.Phrase {
  //     delay(input, data, done) {
  //       setTimeout(function () {
  //         data({text: 'test', value: 'test'})
  //         done()
  //       }, 0)
  //     }
  //
  //     describe() {
  //       return <value compute={this.delay} />
  //     }
  //   }
  //
  //   it('passes start and end for async parse', function (done) {
  //     function callback (err, data) {
  //       expect(err).to.not.exist
  //       expect(data).to.have.length(2)
  //       expect(data[0].event).to.equal('start')
  //       expect(data[1].event).to.equal('end')
  //       expect(data[0].id).to.equal(data[1].id)
  //       expect(data[0].id).to.equal(0)
  //       done()
  //     }
  //
  //     parser.sentences = [<Test />]
  //
  //     es.readArray(['invalid'])
  //     .pipe(parser)
  //     .pipe(es.writeArray(callback))
  //   })
  //
  //   it('passes data between start and end for async parse', function (done) {
  //     function callback (err, data) {
  //       expect(err).to.not.exist
  //       expect(data).to.have.length(3)
  //       expect(data[0].event).to.equal('start')
  //       expect(fulltext.suggestion(data[1].data)).to.equal('test')
  //       expect(data[2].event).to.equal('end')
  //       expect(data[0].id).to.equal(data[2].id)
  //       expect(data[0].id).to.equal(0)
  //       done()
  //     }
  //
  //     parser.sentences = [<Test />]
  //
  //     es.readArray(['t'])
  //     .pipe(parser)
  //     .pipe(es.writeArray(callback))
  //   })
  // })
})
