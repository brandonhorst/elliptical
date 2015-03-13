/** @jsx phrase.createElement */
/* eslint-env mocha */
import {expect} from 'chai'
import fulltext from 'lacona-util-fulltext'
import * as lacona from '..'
import * as phrase from 'lacona-phrase'

function from(i) {const a = []; for (let x of i) a.push(x); return a}

describe('fuzzy: phrase', () => {
  let parser

  beforeEach(() => {
    parser = new lacona.Parser({fuzzy: 'phrase'})
  })

  it('supports fuzzy matching within a phrase', () => {
    parser.sentences = [<literal text='a simple test' />]

    const data = from(parser.parse('asmlte'))
    expect(data).to.have.length(1)
    expect(fulltext.suggestion(data[0])).to.equal('a simple test')
    expect(data[0].suggestion[0].string).to.equal('a')
    expect(data[0].suggestion[0].input).to.be.true
    expect(data[0].suggestion[1].string).to.equal(' ')
    expect(data[0].suggestion[1].input).to.be.false
    expect(data[0].suggestion[2].string).to.equal('s')
    expect(data[0].suggestion[2].input).to.be.true
    expect(data[0].suggestion[3].string).to.equal('i')
    expect(data[0].suggestion[3].input).to.be.false
    expect(data[0].suggestion[4].string).to.equal('m')
    expect(data[0].suggestion[4].input).to.be.true
    expect(data[0].suggestion[5].string).to.equal('p')
    expect(data[0].suggestion[5].input).to.be.false
    expect(data[0].suggestion[6].string).to.equal('l')
    expect(data[0].suggestion[6].input).to.be.true
    expect(data[0].suggestion[7].string).to.equal('e ')
    expect(data[0].suggestion[7].input).to.be.false
    expect(data[0].suggestion[8].string).to.equal('te')
    expect(data[0].suggestion[8].input).to.be.true
    expect(data[0].suggestion[9].string).to.equal('st')
    expect(data[0].suggestion[9].input).to.be.false
  })

  it('rejects misses properly with fuzzy matching', () => {
    parser.sentences = [<literal text='a simple test' />]

    const data = from(parser.parse('fff'))
    expect(data).to.have.length(0)
  })

  it('suggests properly when fuzzy matching is enabled', () => {
    parser.sentences = [<literal text='a simple test' />]

    const data = from(parser.parse(''))
    expect(data).to.have.length(1)
    expect(data[0].suggestion[0].string).to.equal('a simple test')
    expect(data[0].suggestion[0].input).to.be.false
    expect(fulltext.suggestion(data[0])).to.equal('a simple test')
  })

  it('can do fuzzy matching with regex special characters', () => {
    parser.sentences = [<literal text='[whatever]' />]

    const data = from(parser.parse('[]'))
    expect(data).to.have.length(1)
    expect(fulltext.suggestion(data[0])).to.equal('[whatever]')
    expect(data[0].suggestion[0].string).to.equal('[')
    expect(data[0].suggestion[0].input).to.be.true
    expect(data[0].suggestion[1].string).to.equal('whatever')
    expect(data[0].suggestion[1].input).to.be.false
    expect(data[0].suggestion[2].string).to.equal(']')
    expect(data[0].suggestion[2].input).to.be.true
  })

  it('supports sequence when fuzzy is enabled', () => {
    parser.sentences = [
      <sequence>
        <literal text='abc' />
        <literal text='def' />
      </sequence>
    ]

    const data = from(parser.parse('abce'))
    expect(data).to.have.length(1)
    expect(fulltext.suggestion(data[0])).to.equal('def')
    expect(fulltext.match(data[0])).to.equal('abc')
    expect(data[0].suggestion[0].string).to.equal('d')
    expect(data[0].suggestion[0].input).to.be.false
    expect(data[0].suggestion[1].string).to.equal('e')
    expect(data[0].suggestion[1].input).to.be.true
    expect(data[0].suggestion[2].string).to.equal('f')
    expect(data[0].suggestion[2].input).to.be.false
  })

  it('rejects when the word itself does not complete the match', () => {
    parser.sentences = [
      <sequence>
        <literal text='abc' />
        <literal text='def' />
      </sequence>
    ]
    const data = from(parser.parse('ad'))
    expect(data).to.be.empty
  })
})
