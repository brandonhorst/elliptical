/** @jsx phrase.createElement */
/* eslint-env mocha */
import {expect} from 'chai'
import {text} from './_util'
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
    const data = parser.parseArray('')

    expect(data).to.have.length(1)
    expect(text(data[0])).to.equal('literal test')
    expect(data[0].result).to.be.empty
  })

  it('handles a literal with a value', () => {
    parser.grammar = <literal text='literal test' value='test'/>
    const data = parser.parseArray('')

    expect(data).to.have.length(1)
    expect(text(data[0])).to.equal('literal test')
    expect(data[0].result).to.equal('test')
  })

  it('maintains case', () => {
    parser.grammar = <literal text='Test' />
    const data = parser.parseArray('test')

    expect(data).to.have.length(1)
    expect(text(data[0])).to.equal('Test')
  })
})
