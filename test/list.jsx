/** @jsx phrase.createElement */
/* eslint-env mocha */
import {expect} from 'chai'
import fulltext from 'lacona-util-fulltext'
import * as lacona from '..'
import * as phrase from 'lacona-phrase'

function from(i) {const a = []; for (let x of i) a.push(x); return a}

describe('list', () => {
  let parser

  beforeEach(() => {
    parser = new lacona.Parser()
  })

  it('suggests normally without fuzzy', () => {
    parser.grammar = <list items={['testa', 'testb']} />

    const data = from(parser.parse(''))
    expect(data).to.have.length(2)
    expect(fulltext.all(data[0])).to.equal('testa')
    expect(fulltext.all(data[1])).to.equal('testb')
  })

  it('suggests normally with fuzzy', () => {
    parser.grammar = <list items={['testa', 'testb']} fuzzy={true} />

    const data = from(parser.parse(''))
    expect(data).to.have.length(2)
    expect(fulltext.all(data[0])).to.equal('testa')
    expect(fulltext.all(data[1])).to.equal('testb')
  })

  it('matches without fuzzy', () => {
    parser.grammar = <list items={['testa', 'testb']} />

    const data = from(parser.parse('testb'))
    expect(data).to.have.length(1)
    expect(fulltext.all(data[0])).to.equal('testb')
  })

  it('matches with fuzzy', () => {
    parser.grammar = <list items={['testa', 'testb']} fuzzy={true} />

    const data = from(parser.parse('tb'))
    expect(data).to.have.length(1)
    expect(fulltext.all(data[0])).to.equal('testb')
  })

  it('sorts with fuzzy, and limits before it', () => {
    parser.grammar = <list items={['ztest', 'tezst', 'testz', 'tzest']} fuzzy={true} limit={3} />

    const data = from(parser.parse('test'))
    expect(data).to.have.length(3)
    expect(fulltext.all(data[0])).to.equal('testz')
    expect(fulltext.all(data[1])).to.equal('ztest')
    expect(fulltext.all(data[2])).to.equal('tezst')
  })

  it('allows for value without fuzzy', () => {
    const items = [{text: 'testa', value: 'a'}, {text: 'testb', value: 'b'}]
    parser.grammar = <list items={items} />

    const data = from(parser.parse('testb'))
    expect(data).to.have.length(1)
    expect(fulltext.all(data[0])).to.equal('testb')
    expect(data[0].result).to.equal('b')
  })

  it('allows for value with fuzzy', () => {
    const items = [{text: 'testa', value: 'a'}, {text: 'testb', value: 'b'}]
    parser.grammar = <list items={items} fuzzy={true} />

    const data = from(parser.parse('b'))
    expect(data).to.have.length(1)
    expect(fulltext.all(data[0])).to.equal('testb')
    expect(data[0].result).to.equal('b')
  })

  it('allows for value override', () => {
    const items = ['testa', {text: 'testb', value: 'b'}, {text: 'testc'}]
    parser.grammar = <list items={items} value='override' />

    const data = from(parser.parse('t'))
    expect(data).to.have.length(3)
    expect(data[0].result).to.equal('override')
    expect(data[1].result).to.equal('override')
    expect(data[2].result).to.equal('override')
  })

  it('does not output items twice', () => {
    const items = ['testa', 'testb']
    parser.grammar = <list items={items} />

    const data = from(parser.parse('testa'))
    expect(data).to.have.length(1)
    expect(fulltext.all(data[0])).to.equal('testa')
  })

  it('outputs a descriptor', () => {
    const items = [{text: 'testa', descriptor: 'desca'}, 'testb']
    parser.grammar = <list items={items} />

    const data = from(parser.parse('testa'))
    expect(data).to.have.length(1)
    expect(fulltext.all(data[0])).to.equal('testa')
    expect(data[0].match[0].descriptor).to.equal('desca')
  })
})
