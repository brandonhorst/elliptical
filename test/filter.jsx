/** @jsx createElement */
/* eslint-env mocha */
import {createElement} from 'lacona-phrase'
import {expect} from 'chai'
import {Parser} from '..'
import {text} from './_util'

describe('filter', () => {
  var parser

  beforeEach(() => {
    parser = new Parser()
  })

  it('filters result', () => {
    function filter (result) {
      return result === 'b'
    }

    parser.grammar = (
      <filter function={filter}>
        <list items={[{text: 'a', value: 'a'}, {text: 'b', value: 'b'}]} />
      </filter>
    )

    const data = parser.parseArray('')
    expect(data).to.have.length(1)
    expect(text(data[0])).to.equal('b')
    expect(data[0].result).to.equal('b')
  })
})
