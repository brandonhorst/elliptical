/** @jsx createElement */
/* eslint-env mocha */

import createElement from '../src/element'
import {expect} from 'chai'

describe('element', () => {
  it('dereferences builtin types', () => {
    const lit = createElement('literal')
    expect(lit).to.eql({
      type: 'literal',
      props: {},
      children: []
    })
  })

  it('passes through custom types', () => {
    const lit = createElement({test: 1})
    expect(lit).to.eql({
      type: {test: 1},
      props: {},
      children: []
    })
  })

  it('passes through props', () => {
    const lit = createElement('literal', {test: 2})
    expect(lit).to.eql({
      type: 'literal',
      props: {test: 2},
      children: []
    })
  })

  it('passes through children', () => {
    const lit = createElement(
      {test: 1},
      null,
      createElement('literal', {text: 'test'})
    )
    expect(lit).to.eql({
      type: {test: 1},
      props: {},
      children: [{
        type: 'literal',
        props: {text: 'test'},
        children: []
      }]
    })
  })

  it('matches the JSX contact', () => {
    const Test = {test: 1}
    const lit = <Test><literal text='test' /></Test>
    expect(lit).to.eql({
      type: {test: 1},
      props: {},
      children: [{
        type: 'literal',
        props: {text: 'test'},
        children: []
      }]
    })
  })
})
