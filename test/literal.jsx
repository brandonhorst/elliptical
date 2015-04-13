/** @jsx phrase.createElement */
/* eslint-env mocha */
import {expect} from 'chai'
import fulltext from 'lacona-util-fulltext'
import * as lacona from '..'
import * as phrase from 'lacona-phrase'

function from(i) {const a = []; for (let x of i) a.push(x); return a}

describe('literal', function () {
  var parser

  beforeEach(function () {
    parser = new lacona.Parser()
  })

  it('handles a literal', () => {
    parser.grammar = <literal text='literal test' />
    const data = from(parser.parse('l'))

    expect(data).to.have.length(1)
    expect(data[0].suggestion).to.have.length(2)
    expect(data[0].suggestion[0].string).to.equal('l')
    expect(data[0].suggestion[0].input).to.be.true
    expect(data[0].suggestion[1].string).to.equal('iteral test')
    expect(data[0].suggestion[1].input).to.be.false
    expect(data[0].result).to.be.empty
  })

  it('handles a literal with an id', () => {
    parser.grammar = <literal text='literal test' value='test'/>
    const data = from(parser.parse('l'))

    expect(data).to.have.length(1)
    expect(fulltext.suggestion(data[0])).to.equal('literal test')
    expect(data[0].result).to.equal('test')
  })

  it('maintains case', () => {
    parser.grammar = <literal text='Test' />
    const data = from(parser.parse('t'))

    expect(data).to.have.length(1)
    expect(fulltext.suggestion(data[0])).to.equal('Test')
  })
})
