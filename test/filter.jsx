/** @jsx createElement */
/* eslint-env mocha */

import createElement from '../src/element'
import {compileAndTraverse, text} from './_util'
import chai, {expect} from 'chai'
import {spy} from 'sinon'
import sinonChai from 'sinon-chai'

chai.use(sinonChai)

describe('filter', () => {
  it('filters result', () => {
    function filter (option) {
      return option.result === 'b'
    }

    const grammar = (
      <filter outbound={filter}>
        <list items={[{text: 'a', value: 'a'}, {text: 'b', value: 'b'}]} />
      </filter>
    )

    const options = compileAndTraverse(grammar, '')
    expect(options).to.have.length(1)
    expect(text(options[0])).to.equal('b')
    expect(options[0].result).to.equal('b')
  })

  it('does not filter with placeholders', () => {
    const filterSpy = spy()

    function filter (option) {
      filterSpy()
      return true
    }

    const grammar = (
      <filter outbound={filter} skipIncomplete>
        <label text='test'>
          <literal text='s' />
        </label>
      </filter>
    )

    const options = compileAndTraverse(grammar, '')
    expect(options).to.have.length(1)
    expect(filterSpy).to.not.have.been.called
    expect(text(options[0])).to.equal('test')
    expect(options[0].result).to.be.undefined
  })

  it('filters inbound', () => {
    const tapSpy = spy()
    function filter (option) {
      return false
    }

    const grammar = (
      <filter inbound={filter}>
        <tap inbound={tapSpy}>
          <literal text='test' />
        </tap>
      </filter>
    )

    const options = compileAndTraverse(grammar, '')
    expect(options).to.have.length(0)
    expect(tapSpy).to.not.have.been.called
  })
})
