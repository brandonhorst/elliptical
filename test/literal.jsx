/* eslint-env mocha */

import _ from 'lodash'
import element from '../src/element'
import {reconcileAndTraverse} from './_util'

import { expect } from 'chai'

describe('literal', () => {
  it('handles a literal', () => {
    const options = reconcileAndTraverse(
      <literal text='literal test' value='test' />
    , '')

    expect(options).to.eql([{
      text: null,
      words: [{text: 'literal test', input: false}],
      result: 'test',
      score: 1,
      qualifiers: []
    }]);
  })

  it('maintains case', () => {
    const grammar = <literal text='Test' />
    const options = reconcileAndTraverse(grammar, '')

    expect(options).to.eql([{
      text: null,
      words: [{text: 'Test', input: false}],
      result: undefined,
      score: 1,
      qualifiers: []
    }]);
  })

  describe('decorate', () => {
    it('suggests a decoration', () => {
      const grammar = (
        <sequence>
          <literal text='a' />
          <literal text='b' decorate />
        </sequence>
      )
      const options = reconcileAndTraverse(grammar , 'a')

      expect(options).to.eql([{
        text: null,
        words: [{text: 'a', input: true}, {text: 'b', input: false}],
        result: {},
        score: 1,
        qualifiers: []
      }]);
    })

    it('decorates an input', () => {
      const grammar = (
        <sequence>
          <literal text='b' decorate />
          <literal text='a' />
        </sequence>
      )
      const options = reconcileAndTraverse(grammar , 'a')

      expect(options).to.eql([{
        text: '',
        words: [{text: 'b', input: false}, {text: 'a', input: true}],
        result: {},
        score: 1,
        qualifiers: []
      }]);
    })

    it('allows allowinput to be false', () => {
      const grammar = (
        <sequence>
          <literal text='b' decorate allowInput={false} />
          <literal text='a' />
        </sequence>
      )
      let options

      options = reconcileAndTraverse(grammar , 'a')
      expect(options).to.eql([{
        text: '',
        words: [{text: 'b', input: false}, {text: 'a', input: true}],
        result: {},
        score: 1,
        qualifiers: []
      }]);

      options = reconcileAndTraverse(grammar , 'b')
      expect(options).to.eql([])
    })
  })
})
