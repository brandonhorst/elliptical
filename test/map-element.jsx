/** @jsx createElement */
/* eslint-env mocha */
import { expect } from 'chai'
import { text } from './_util'
import { Parser } from '..'
import { createElement } from 'lacona-phrase'

describe('elements/map', () => {
  let parser

  beforeEach(() => {
    parser = new Parser()
  })
  it('maps an element\'s result', () => {
    function addIng (result) {
      return `${result}ing`
    }

    parser.grammar = (
      <map function={addIng}>
        <literal text='test' value='test' />
      </map>
    )

    const data = parser.parseArray('test')
    expect(data).to.have.length(1)
    expect(text(data[0])).to.equal('test')
    expect(data[0].result).to.eql('testing')
  })
})
