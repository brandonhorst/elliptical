/* eslint-env mocha */

import element from '../src/element'
import {reconcileAndTraverse, text} from './_util'
import chai, {expect} from 'chai'
import {spy} from 'sinon'
import sinonChai from 'sinon-chai'

chai.use(sinonChai)

describe('filter', () => {
  it('filters result', () => {
    function filter (result) {
      return result === 'b'
    }

    const grammar = (
      <filter func={filter}>
        <list items={[{text: 'a', value: 'a'}, {text: 'b', value: 'b'}]} />
      </filter>
    )

    const options = reconcileAndTraverse(grammar, '')
    expect(options).to.have.length(1)
    expect(text(options[0])).to.equal('b')
    expect(options[0].result).to.equal('b')
  })

  it('does not filter with placeholders', () => {
    const filterSpy = spy()

    function filter (result) {
      filterSpy()
      return true
    }

    const grammar = (
      <filter func={filter}>
        <label text='test'>
          <literal text='s' />
        </label>
      </filter>
    )

    const options = reconcileAndTraverse(grammar, '')
    expect(options).to.have.length(1)
    expect(filterSpy).to.not.have.been.called
    expect(text(options[0])).to.equal('test')
    expect(options[0].result).to.be.undefined
  })

})
