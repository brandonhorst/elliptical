/** @jsx createElement */
/* eslint-env mocha */

import { expect } from 'chai'
import { text } from './_util'
import { Parser, LaconaError } from '..'
import { createElement, Phrase } from 'lacona-phrase'

describe('Parser', () => {
  var parser

  beforeEach(() => {
    parser = new Parser()
  })

  it('requires string input', () => {
    expect(() => parser.parseArray(123)).to.throw(LaconaError)
  })

  it('can parse in a specified language', () => {
    class Test extends Phrase {
      static translations = [{
        langs: ['en', 'default'],
        describe () { return <literal text='test' /> }
      }, {
        langs: ['es'],
        describe () { return <literal text='prueba' /> }
      }]
    }

    parser.langs = ['es']
    parser.grammar = <Test />

    const data = parser.parseArray('')
    expect(data).to.have.length(1)
    expect(text(data[0])).to.equal('prueba')
  })

  it('falls back on a less specific language if the most specific is not provided', () => {
    class Test extends Phrase {
      static translations = [{
        langs: ['en', 'default'],
        describe () {
          return <literal text='train' />
        }
      }, {
        langs: ['es'],
        describe () {
          return <literal text='tren' />
        }
      }]
    }

    parser.langs = ['es_ES', 'es']
    parser.grammar = <Test />

    const data = parser.parseArray('')
    expect(data).to.have.length(1)
    expect(text(data[0])).to.equal('tren')
  })
})
