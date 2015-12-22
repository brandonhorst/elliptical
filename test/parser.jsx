/** @jsx phrase.createElement */
/* eslint-env mocha */
import chai, {expect} from 'chai'
import Choice from '../lib/elements/choice'
import {text} from './_util'
import * as lacona from '..'
import Literal from '../lib/elements/literal'
import * as phrase from 'lacona-phrase'

describe('Parser', () => {
  var parser

  beforeEach(() => {
    parser = new lacona.Parser()
  })

  it('requires string input', () => {
    expect(() => parser.parseArray(123)).to.throw(Error)
  })

  it('can parse in a specified language', () => {
    class Test extends phrase.Phrase {
      static get translations() {
        return [{
          langs: ['en', 'default'],
          describe() {return <literal text='test' />}
        }, {
          langs: ['es'],
          describe() {return <literal text='prueba' />}
        }]
      }
    }

    parser.langs = ['es']
    parser.grammar = <Test />

    const data = parser.parseArray('')
    expect(data).to.have.length(1)
    expect(text(data[0])).to.equal('prueba')
  })

  it('falls back on a less specific language if the most specific is not provided', () => {
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

    parser.langs = ['es_ES', 'es']
    parser.grammar = <Test />

    const data = parser.parseArray('')
    expect(data).to.have.length(1)
    expect(text(data[0])).to.equal('tren')
  })
})
