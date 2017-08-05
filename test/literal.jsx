/** @jsx createElement */
/* eslint-env mocha */

import createElement from '../src/element'
import {compileAndTraverse} from './_util'

import { expect } from 'chai'

describe('literal', () => {
  it('handles a literal', () => {
    const options = compileAndTraverse(
      <literal text='literal test' value='test' />
    , '')

    expect(options).to.eql([{
      text: null,
      words: [{text: 'literal test', input: false}],
      result: 'test',
      score: 1,
      qualifiers: [],
      categories: [],
      arguments: [],
      annotations:[],
      data: []
    }])
  })

  it('maintains case', () => {
    const grammar = <literal text='Test' />
    const options = compileAndTraverse(grammar, '')

    expect(options).to.eql([{
      text: null,
      words: [{text: 'Test', input: false}],
      result: undefined,
      score: 1,
      qualifiers: [],
      categories: [],
      arguments: [],
      annotations:[],
      data: []
    }])
  })

  describe('decorate', () => {
    it('suggests a decoration', () => {
      const grammar = (
        <sequence>
          <literal text='a' />
          <literal text='b' decorate />
        </sequence>
      )
      const options = compileAndTraverse(grammar, 'a')

      expect(options).to.eql([{
        text: null,
        words: [{text: 'a', input: true}, {text: 'b', input: false}],
        result: {},
        score: 1,
        qualifiers: [],
        categories: [],
        arguments: [],
        annotations:[],
        data: []
      }])
    })

    it('decorates an input', () => {
      const grammar = (
        <sequence>
          <literal text='b' decorate />
          <literal text='a' />
        </sequence>
      )
      const options = compileAndTraverse(grammar, 'a')

      expect(options).to.eql([{
        text: '',
        words: [{text: 'b', input: false}, {text: 'a', input: true}],
        result: {},
        score: 1,
        qualifiers: [],
        categories: [],
        arguments: [],
        annotations:[],
        data: []
      }])
    })

    it('decorates an input (limited)', () => {
      const grammar = (
        <sequence>
          <literal text='b' decorate />
          <freetext />
        </sequence>
      )
      const options = compileAndTraverse(grammar, 'ba')

      expect(options).to.eql([{
        text: '',
        words: [{text: 'b', input: true}, {text: 'a', input: true}],
        result: {},
        score: 0.6,
        qualifiers: [],
        categories: [],
        arguments: [],
        annotations:[],
        data: []
      }])
    })

    it('decorates an input (not limited)', () => {
      const grammar = (
        <sequence>
          <literal text='b' decorate limitDecoration={false} />
          <freetext />
        </sequence>
      )
      const options = compileAndTraverse(grammar, 'ba')

      expect(options).to.have.length(2)
      expect(options[0].words).to.eql(
        [{text: 'b', input: true}, {text: 'a', input: true}]
      )
      expect(options[1].words).to.eql(
        [{text: 'b', input: false}, {text: 'ba', input: true}]
      )
    })

    it('allows allowinput to be false', () => {
      const grammar = (
        <sequence>
          <literal text='b' decorate allowInput={false} />
          <literal text='a' />
        </sequence>
      )
      let options

      options = compileAndTraverse(grammar, 'a')
      expect(options).to.eql([{
        text: '',
        words: [{text: 'b', input: false}, {text: 'a', input: true}],
        result: {},
        score: 1,
        qualifiers: [],
        categories: [],
        arguments: [],
        annotations:[],
        data: []
      }])

      options = compileAndTraverse(grammar, 'b')
      expect(options).to.eql([])
    })
  })
})
