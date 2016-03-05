/* eslint-env mocha */

import _ from 'lodash'
import element from '../src/element'
import {reconcileAndTraverse, text} from './_util'

import { expect } from 'chai'

describe('choice', () => {
  it('suggests one valid choice', () => {
    const grammar = (
      <choice>
        <literal text='right' />
        <literal text='wrong' />
      </choice>
    )
    const options = reconcileAndTraverse(grammar, 'r')

    expect(options).to.eql([{
      text: null,
      words: [{text: 'r', input: true}, {text: 'ight', input: false}],
      result: undefined,
      score: 1,
      qualifiers: []
    }]);
  })

  it('suggests multiple valid choices', () => {
    const grammar = (
      <choice>
        <literal text='right' />
        <literal text='right also' />
      </choice>
    )
    const options = reconcileAndTraverse(grammar, 'r')

    expect(options).to.eql([{
      text: null,
      words: [{text: 'r', input: true}, {text: 'ight', input: false}],
      result: undefined,
      score: 1,
      qualifiers: []
    }, {
      text: null,
      words: [{text: 'r', input: true}, {text: 'ight also', input: false}],
      result: undefined,
      score: 1,
      qualifiers: []
    }]);
  })

  it('suggests no valid choices', () => {
    const grammar = (
      <choice>
        <literal text='wrong' />
        <literal text='wrong also' />
      </choice>
    )
    const options = reconcileAndTraverse(grammar, 'r')

    expect(options).to.eql([]);
  })

  it('adopts the value of the child', () => {
    const grammar = (
      <choice>
        <literal text='right' value='testValue' />
        <literal text='wrong' />
      </choice>
    )
    const options = reconcileAndTraverse(grammar, 'r')

    expect(options).to.eql([{
      text: null,
      words: [{text: 'r', input: true}, {text: 'ight', input: false}],
      result: 'testValue',
      score: 1,
      qualifiers: []
    }]);
  })

  it('can set a value', () => {
    const grammar = (
      <choice value='override'>
        <literal text='right' value='testValue' />
        <literal text='wrong' />
      </choice>
    )
    const options = reconcileAndTraverse(grammar, 'r')

    expect(options).to.eql([{
      text: null,
      words: [{text: 'r', input: true}, {text: 'ight', input: false}],
      result: 'override',
      score: 1,
      qualifiers: []
    }]);
  })

  it('can set a value in an object with an id', () => {
    const grammar = (
      <choice>
        <literal text='right' value='testValue' id='key' />
        <literal text='wrong' />
      </choice>
    )
    const options = reconcileAndTraverse(grammar, 'r')

    expect(options).to.eql([{
      text: null,
      words: [{text: 'r', input: true}, {text: 'ight', input: false}],
      result: {key: 'testValue'},
      score: 1,
      qualifiers: []
    }]);
  })

  it('can be restricted by a limit of 1', () => {
    const grammar = (
      <choice limit={1}>
        <literal text='right' value='testValue' />
        <literal text='right also' value='also' />
      </choice>
    )

    const options = reconcileAndTraverse(grammar, '')
    expect(options).to.have.length(1)
    expect(text(options[0])).to.equal('right')
    expect(options[0].result).to.equal('testValue')
  })

  it('can be restricted by a limit of more than 1', () => {
    const grammar = (
      <choice limit={2}>
        <literal text='right' />
        <literal text='right also' />
        <literal text='right but excluded' />
      </choice>
    )

    const options = reconcileAndTraverse(grammar, '')
    expect(options).to.have.length(2)
    expect(text(options[0])).to.equal('right')
    expect(text(options[1])).to.equal('right also')
  })

  it('still works when a limited child has multiple options', () => {
    const grammar = (
      <choice limit={2}>
        <choice>
          <literal text='right' />
          <literal text='right also' />
        </choice>
        <literal text='wrong' />
        <literal text='right third' />
      </choice>
    )

    const options = reconcileAndTraverse(grammar, 'ri')
    expect(options).to.have.length(3)
    expect(text(options[0])).to.equal('right')
    expect(text(options[1])).to.equal('right also')
    expect(text(options[2])).to.equal('right third')
  })

  it('allows choices in sequences to be limited', () => {
    const grammar = (
      <sequence>
        <choice limit={2}>
          <literal text='testa' />
          <literal text='x' />
          <literal text='testb' />
          <literal text='testc' />
        </choice>
        <literal text='also' />
      </sequence>
    )

    const options = reconcileAndTraverse(grammar, 'test')
    expect(options).to.have.length(2)
    expect(text(options[0])).to.equal('testaalso')
    expect(text(options[1])).to.equal('testbalso')
  })

  it('limits even if valid parses do not parse to completion', () => {
    const grammar = (
      <sequence>
        <choice limit={1}>
          <literal text='righ' />
          <literal text='right' />
          <literal text='righta' />
        </choice>
        <literal text='also' />
      </sequence>
    )

    const options = reconcileAndTraverse(grammar, 'righta')
    expect(options).to.have.length(1)
    expect(text(options[0])).to.equal('rightalso')
  })
})
