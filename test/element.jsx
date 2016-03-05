/* eslint-env mocha */

import literal from '../src/elements/literal'
import element from '../src/element'
import {expect} from 'chai'

describe('element', () => {
  it('dereferences builtin types', () => {
    const lit = element('literal')
    expect(lit).to.eql({
      type: literal,
      attributes: {},
      children: []
    })
  })

  it('passes through custom types', () => {
    const lit = element({test: 1})
    expect(lit).to.eql({
      type: {test: 1},
      attributes: {},
      children: []
    })
  })

  it('passes through attributes', () => {
    const lit = element('literal', {test: 2})
    expect(lit).to.eql({
      type: literal,
      attributes: {test: 2},
      children: []
    })
  })

  it('passes through children', () => {
    const lit = element({test: 1}, null, element('literal', {text: 'test'}))
    expect(lit).to.eql({
      type: {test: 1},
      attributes: {},
      children: [{
        type: literal,
        attributes: {text: 'test'},
        children: []
      }]
    })
  })

  it('matches the JSX contact', () => {
    const Test = {test: 1}
    const lit = <Test><literal text='test' /></Test>
    expect(lit).to.eql({
      type: {test: 1},
      attributes: {},
      children: [{
        type: literal,
        attributes: {text: 'test'},
        children: []
      }]
    })
  })
})
