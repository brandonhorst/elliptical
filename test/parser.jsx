/** @jsx phrase.createElement */
/* eslint-env mocha */
import chai, {expect} from 'chai'
import Choice from '../lib/elements/choice'
import fulltext from 'lacona-util-fulltext'
import * as lacona from '..'
import Literal from '../lib/elements/literal'
import * as phrase from 'lacona-phrase'
import Value from '../lib/elements/value'

function from(i) {const a = []; for (let x of i) a.push(x); return a}

describe('Parser', () => {
  var parser

  beforeEach(() => {
    parser = new lacona.Parser()
  })

  it('requires string input', () => {
    expect(parser.parse(123)).to.throw
  })
  
  it('passes the path to the output', () => {
    parser.grammar = <literal text='test' />

    const data = from(parser.parse('t'))
    expect(data).to.have.length(1)
    expect(data[0].path).to.have.length(2)
    expect(data[0].path[0]).to.be.an.instanceof(Literal)
    expect(data[0].path[1]).to.be.an.instanceof(Value)
  })

  it('path contains every element passed through', () => {
    parser.grammar = <choice><literal text='test' /></choice>

    const data = from(parser.parse('t'))
    expect(data).to.have.length(1)
    expect(data[0].path).to.have.length(3)
    expect(data[0].path[0]).to.be.an.instanceof(Choice)
    expect(data[0].path[1]).to.be.an.instanceof(Literal)
    expect(data[0].path[2]).to.be.an.instanceof(Value)
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

    const data = from(parser.parse('p'))
    expect(data).to.have.length(1)
    expect(fulltext.suggestion(data[0])).to.equal('prueba')
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

    const data = from(parser.parse('tr'))
    expect(data).to.have.length(1)
    expect(fulltext.suggestion(data[0])).to.equal('tren')
  })
})
