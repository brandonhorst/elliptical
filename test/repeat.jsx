/* eslint-env mocha */

import _ from 'lodash'
import element from '../src/element'
import {reconcileAndTraverse} from './_util'

import { expect } from 'chai'

describe('repeat', () => {
  describe('separator', () => {
    it('does not accept input that does not match the child', () => {
      const grammar = (
        <repeat separator={<literal text='man' />}>
          <literal text='super' />
        </repeat>
      )

      const options = reconcileAndTraverse(grammar, 'wrong')
      expect(options).to.eql([])

    })

    it('accepts the child on its own', () => {
      const grammar = (
        <repeat separator={<literal text='man' />}>
          <literal text='super' />
        </repeat>
      )

      const options = reconcileAndTraverse(grammar, 'superm')
      expect(options).to.eql([{
        text: null,
        words: [
          {text: 'super', input: true},
          {text: 'm', input: true},
          {text: 'an', input: false},
          {text: 'super', input: false}
        ],
        result: [undefined, undefined],
        score: 1,
        qualifiers: []
      }]);
    })

    it('accepts the child twice, with the separator in the middle', () => {
      const grammar = (
        <repeat separator={<literal text='man' />}>
          <literal text='super' />
        </repeat>
      )

      const options = reconcileAndTraverse(grammar, 'supermans')
      expect(options).to.eql([{
        text: null,
        words: [
          {text: 'super', input: true},
          {text: 'man', input: true},
          {text: 's', input: true},
          {text: 'uper', input: false}
        ],
        result: [undefined, undefined],
        score: 1,
        qualifiers: []
      }]);
    })

    it('accepts the child twice and suggests when complete, with the separator in the middle', () => {
      const grammar = (
        <repeat separator={<literal text='man' />}>
          <literal text='super' />
        </repeat>
      )

      const options = reconcileAndTraverse(grammar, 'supermansuper')
      expect(options).to.eql([{
        text: '',
        words: [
          {text: 'super', input: true},
          {text: 'man', input: true},
          {text: 'super', input: true}
        ],
        result: [undefined, undefined],
        score: 1,
        qualifiers: []
      }, {
        text: null,
        words: [
          {text: 'super', input: true},
          {text: 'man', input: true},
          {text: 'super', input: true},
          {text: 'man', input: false},
          {text: 'super', input: false}
        ],
        result: [undefined, undefined, undefined],
        score: 1,
        qualifiers: []
      }]);
    })

    it('allows for content to have children', () => {
      const grammar = (
        <repeat separator={<literal text=' ' />}>
          <choice>
            <literal text='a' />
            <literal text='b' />
          </choice>
        </repeat>
      )

      const options = reconcileAndTraverse(grammar, 'a ')
      expect(options).to.eql([{
        text: null,
        words: [
          {text: 'a', input: true},
          {text: ' ', input: true},
          {text: 'a', input: false}
        ],
        result: [undefined, undefined],
        score: 1,
        qualifiers: []
      }, {
        text: null,
        words: [
          {text: 'a', input: true},
          {text: ' ', input: true},
          {text: 'b', input: false}
        ],
        result: [undefined, undefined],
        score: 1,
        qualifiers: []
      }]);
    })
  })

  it('allows for content to have children', () => {
    const grammar = (
      <repeat>
        <choice>
          <literal text='a' />
          <literal text='b' />
        </choice>
      </repeat>
    )

    const options = reconcileAndTraverse(grammar, '')
    expect(options).to.eql([{
      text: null,
      words: [{text: 'a', input: false}],
      result: [undefined],
      score: 1,
      qualifiers: []
    }, {
      text: null,
      words: [{text: 'b', input: false}],
      result: [undefined],
      score: 1,
      qualifiers: []
    }]);
  })

  it('does not accept input that does not match the child', () => {
    const grammar = (
      <repeat>
        <literal text='super' />
      </repeat>
    )
    const options = reconcileAndTraverse(grammar, 'wrong')
    expect(options).to.eql([])
  })

  it('accepts the child on its own', () => {
    const grammar = (
      <repeat>
        <literal text='super' value='a' />
      </repeat>
    )

    const options = reconcileAndTraverse(grammar, 'sup')
    expect(options).to.eql([{
      text: null,
      words: [{text: 'sup', input: true}, {text: 'er', input: false}],
      result: ['a'],
      score: 1,
      qualifiers: []
    }]);
  })

  it('accepts the child twice', () => {
    const grammar = (
      <repeat>
        <literal text='super' value='a' />
      </repeat>
    )

    const options = reconcileAndTraverse(grammar, 'supers')
    expect(options).to.eql([{
      text: null,
      words: [
        {text: 'super', input: true},
        {text: 's', input: true},
        {text: 'uper', input: false}
      ],
      result: ['a', 'a'],
      score: 1,
      qualifiers: []
    }]);
  })

  it('accepts the child thrice', () => {
    const grammar = (
      <repeat>
        <literal text='super' value='a' />
      </repeat>
    )

    const options = reconcileAndTraverse(grammar, 'supersuper')
    expect(options).to.eql([{
      text: '',
      words: [
        {text: 'super', input: true},
        {text: 'super', input: true},
      ],
      result: ['a', 'a'],
      score: 1,
      qualifiers: []
    }, {
      text: null,
      words: [
        {text: 'super', input: true},
        {text: 'super', input: true},
        {text: 'super', input: false},
      ],
      result: ['a', 'a', 'a'],
      score: 1,
      qualifiers: []
    }]);
  })

  it('does not accept fewer than min iterations', () => {
    const grammar = (
      <repeat min={2}>
        <literal text='a' value='a' />
      </repeat>
    )

    const options = reconcileAndTraverse(grammar, 'a')
    expect(options).to.eql([{
      text: null,
      words: [
        {text: 'a', input: true},
        {text: 'a', input: false},
      ],
      result: ['a', 'a'],
      score: 1,
      qualifiers: []
    }]);
  })

  it('does not accept more than max iterations', () => {
    const grammar = (
      <repeat max={1} >
        <literal text='a' value='a' />
      </repeat>
    )

    const options = reconcileAndTraverse(grammar, 'a')
    expect(options).to.eql([{
      text: '',
      words: [
        {text: 'a', input: true},
      ],
      result: ['a'],
      score: 1,
      qualifiers: []
    }]);
  })

  it('unique rejects non-unique repeated elements', () => {
    const grammar = (
      <repeat unique>
        <choice>
          <literal text='a' value='a' />
          <literal text='b' value='b' />
        </choice>
      </repeat>
    )

    const options = reconcileAndTraverse(grammar, 'aa')
    expect(options).to.eql([])
  })

  it('unique rejects non-unique repeated elements (deep)', () => {
    const grammar = (
      <repeat unique>
        <choice>
          <literal text='a' value={{a: 1}} />
          <literal text='b' value={{a: 1}} />
        </choice>
      </repeat>
    )

    const options = reconcileAndTraverse(grammar, 'ab')
    expect(options).to.eql([])
  })

  it('unique accepts unique repeated elements', () => {
    const grammar = (
      <repeat unique>
        <choice>
          <literal text='a' value='a' />
          <literal text='b' value='b' />
        </choice>
      </repeat>
    )

    const options = reconcileAndTraverse(grammar, 'ab')
    expect(options).to.eql([{
      text: '',
      words: [
        {text: 'a', input: true},
        {text: 'b', input: true},
      ],
      result: ['a', 'b'],
      score: 1,
      qualifiers: []
    }]);
  })

  it('unique accepts unique repeated elements (deep)', () => {
    const grammar = (
      <repeat unique>
        <choice>
          <literal text='a' value={{a: 1}} />
          <literal text='b' value={{a: 2}} />
        </choice>
      </repeat>
    )

    const options = reconcileAndTraverse(grammar, 'ab')
    expect(options).to.eql([{
      text: '',
      words: [
        {text: 'a', input: true},
        {text: 'b', input: true},
      ],
      result: [{a: 1}, {a: 2}],
      score: 1,
      qualifiers: []
    }]);
  })

  it('allows for choices inside of repeats to be limited', () => {
    const grammar = (
      <repeat>
        <choice limit={1}>
          <literal text='aa' />
          <literal text='ab' />
          <literal text='ac' />
        </choice>
      </repeat>
    )

    const options = reconcileAndTraverse(grammar, 'aba')
    expect(options).to.eql([{
      text: null,
      words: [
        {text: 'ab', input: true},
        {text: 'a', input: true},
        {text: 'a', input: false},
      ],
      result: [undefined, undefined],
      score: 1,
      qualifiers: []
    }]);
  })

  it('allows for choices inside of repeat separators to be limited', () => {
    const grammar = (
      <repeat separator={
        <choice limit={1}>
          <literal text='aa' />
          <literal text='ab' />
          <literal text='ac' />
        </choice>
      }>
        <literal text='x' />
      </repeat>
    )

    const options = reconcileAndTraverse(grammar, 'xa')
    expect(options).to.eql([{
      text: null,
      words: [
        {text: 'x', input: true},
        {text: 'a', input: true},
        {text: 'a', input: false},
        {text: 'x', input: false},
      ],
      result: [undefined, undefined],
      score: 1,
      qualifiers: []
    }]);
  })
})
