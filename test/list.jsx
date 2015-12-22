/** @jsx phrase.createElement */
/* eslint-env mocha */
import {expect} from 'chai'
import {text} from './_util'
import * as lacona from '..'
import * as phrase from 'lacona-phrase'

describe('list', () => {
  let parser

  beforeEach(() => {
    parser = new lacona.Parser()
  })

  it('suggests normally without fuzzy', () => {
    parser.grammar = <list items={['testa', 'testb']} />

    const data = parser.parseArray('')
    expect(data).to.have.length(2)
    expect(text(data[0])).to.equal('testa')
    expect(text(data[1])).to.equal('testb')
  })

  it('suggests normally with fuzzy', () => {
    parser.grammar = <list items={['testa', 'testb']} fuzzy />

    const data = parser.parseArray('')
    expect(data).to.have.length(2)
    expect(text(data[0])).to.equal('testa')
    expect(text(data[1])).to.equal('testb')
  })

  it('matches without fuzzy', () => {
    parser.grammar = <list items={['testa', 'testb']} />

    const data = parser.parseArray('testb')
    expect(data).to.have.length(1)
    expect(text(data[0])).to.equal('testb')
  })

  it('matches with fuzzy', () => {
    parser.grammar = <list items={['testa', 'testb']} fuzzy />

    const data = parser.parseArray('b')
    expect(data).to.have.length(1)
    expect(text(data[0])).to.equal('testb')
  })

  it('sorts with fuzzy, and limits before it', () => {
    parser.grammar = <list items={['ztest', 'testz', 'zztest']} fuzzy limit={2} />

    const data = parser.parseArray('test')
    expect(data).to.have.length(2)
    expect(text(data[0])).to.equal('testz')
    expect(text(data[1])).to.equal('ztest')
  })

  // it('sorts with fuzzy, and limits before it', () => {
  //   parser.grammar = <list items={['ztest', 'tezst', 'testz', 'tzest']} fuzzy limit={3} />
  //
  //   const data = parser.parseArray($1)
  //   expect(data).to.have.length(3)
  //   expect(text(data[0])).to.equal('testz')
  //   expect(text(data[1])).to.equal('ztest')
  //   expect(text(data[2])).to.equal('tezst')
  // })

  it('allows for value without fuzzy', () => {
    const items = [{text: 'testa', value: 'a'}, {text: 'testb', value: 'b'}]
    parser.grammar = <list items={items} />

    const data = parser.parseArray('testb')
    expect(data).to.have.length(1)
    expect(text(data[0])).to.equal('testb')
    expect(data[0].result).to.equal('b')
  })

  it('allows for value with fuzzy', () => {
    const items = [{text: 'testa', value: 'a'}, {text: 'testb', value: 'b'}]
    parser.grammar = <list items={items} fuzzy />

    const data = parser.parseArray('b')
    expect(data).to.have.length(1)
    expect(text(data[0])).to.equal('testb')
    expect(data[0].result).to.equal('b')
  })

  it('allows for value override', () => {
    const items = ['testa', {text: 'testb', value: 'b'}, {text: 'testc'}]
    parser.grammar = <list items={items} value='override' />

    const data = parser.parseArray('')
    expect(data).to.have.length(3)
    expect(data[0].result).to.equal('override')
    expect(data[1].result).to.equal('override')
    expect(data[2].result).to.equal('override')
  })

  // it('outputs a qualifier', () => {
  //   const items = [{text: 'testa', qualifier: 'desca'}, 'testb']
  //   parser.grammar = <list items={items} />
  //
  //   const data = parser.parseArray('')
  //   expect(data).to.have.length(1)
  //   expect(text(data[0])).to.equal('testa')
  //   expect(data[0].match[0].qualifier).to.equal('desca')
  // })
  //
  // it('outputs a qualifier (fuzzy)', () => {
  //   const items = [{text: 'testa', qualifier: 'desca'}, 'testb']
  //   parser.grammar = <list items={items} fuzzy='true' />
  //
  //   const data = parser.parseArray('')
  //   expect(data).to.have.length(1)
  //   expect(text(data[0])).to.equal('testa')
  //   expect(data[0].suggestion[0].qualifier).to.equal('desca')
  // })
  //

  it('outputs score', () => {
    const items = ['ztest', 'testz', 'tezst']
    parser.grammar = <list items={items} fuzzy />

    const data = parser.parseArray('test')
    expect(data).to.have.length(2)
    expect(text(data[0])).to.equal('testz')
    expect(data[0].score).to.equal(1)
    expect(text(data[1])).to.equal('ztest')
    expect(data[1].score).to.equal(0.5)
    // expect(text(data[2])).to.equal('tezst')
    // expect(data[2].score).to.equal(0.25)
  })
})
