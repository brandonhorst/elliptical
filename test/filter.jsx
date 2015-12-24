/** @jsx createElement */
/* eslint-env mocha */
import { createElement } from 'lacona-phrase'
import chai, { expect } from 'chai'
import { Parser } from '..'
import { text } from './_util'
import { spy } from 'sinon'
import sinonChai from 'sinon-chai'

chai.use(sinonChai)

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

  it('does not filter with placeholders', () => {
    const filterSpy = spy()

    function filter (result) {
      filterSpy()
      return true
    }

    parser.grammar = (
      <filter function={filter}>
        <label text='test' suppressEmpty>
          <literal text='s' />
        </label>
      </filter>
    )

    const data = parser.parseArray('')
    expect(data).to.have.length(1)
    expect(filterSpy).to.not.have.been.called
    expect(text(data[0])).to.equal('test')
    expect(data[0].result).to.be.undefined
  })

})
