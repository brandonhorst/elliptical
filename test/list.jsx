/** @jsx createElement */
/* eslint-env mocha */

import createElement from '../src/element'
import unique from '../src/unique'
import {compileAndTraverse} from './_util'

import { expect } from 'chai'

describe('list', () => {
  it('suggests normally', () => {
    const grammar = <list items={['testa', 'testb']} />

    const options = compileAndTraverse(grammar, '')
    expect(options).to.eql([{
      text: null,
      words: [{text: 'testa', input: false}],
      result: undefined,
      score: 1,
      categories: [],
      arguments: [],
      qualifiers: [],
      annotations:[],
      data: []
    }, {
      text: null,
      words: [{text: 'testb', input: false}],
      result: undefined,
      score: 1,
      qualifiers: [],
      categories: [],
      arguments: [],
      annotations:[],
      data: []
    }])
  })

  it('ignores nulls', () => {
    const grammar = <list items={[null, 'testb']} />

    const options = compileAndTraverse(grammar, '')
    expect(options).to.eql([{
      text: null,
      words: [{text: 'testb', input: false}],
      result: undefined,
      score: 1,
      qualifiers: [],
      categories: [],
      arguments: [],
      annotations:[],
      data: []
    }])
  })

  it('suggests normally with contain', () => {
    const grammar = <list items={['testa', 'testb']} strategy='contain' />

    const options = compileAndTraverse(grammar, '')
    expect(options).to.eql([{
      text: null,
      words: [{text: 'testa', input: false}],
      result: undefined,
      score: 1,
      qualifiers: [],
      categories: [],
      arguments: [],
      annotations:[],
      data: []
    }, {
      text: null,
      words: [{text: 'testb', input: false}],
      result: undefined,
      score: 1,
      qualifiers: [],
      categories: [],
      arguments: [],
      annotations:[],
      data: []
    }])
  })

  it('matches', () => {
    const grammar = <list items={['testa', 'testb']} />

    const options = compileAndTraverse(grammar, 'testb')
    expect(options).to.eql([{
      text: '',
      words: [{text: 'testb', input: true}],
      result: undefined,
      score: 1,
      qualifiers: [],
      categories: [],
      arguments: [],
      annotations:[],
      data: []
    }])
  })

  it('matches with contain', () => {
    const grammar = <list items={['testa', 'testb']} strategy='contain' />

    const options = compileAndTraverse(grammar, 'b')
    expect(options).to.eql([{
      text: null,
      words: [{text: 'test', input: false}, {text: 'b', input: true}],
      result: undefined,
      score: 0.6,
      qualifiers: [],
      categories: [],
      arguments: [],
      annotations:[],
      data: []
    }])
  })

  it('sorts with contain, and limits before it', () => {
    const grammar = <list
      items={['ztest', 'testz', 'zztest']}
      strategy='contain'
      limit={2} />

    const options = compileAndTraverse(grammar, 'test')
    expect(options).to.eql([{
      text: null,
      words: [{text: 'test', input: true}, {text: 'z', input: false}],
      result: undefined,
      score: 1,
      qualifiers: [],
      categories: [],
      arguments: [],
      annotations:[],
      data: []
    }, {
      text: null,
      words: [{text: 'z', input: false}, {text: 'test', input: true}],
      result: undefined,
      score: 0.9,
      qualifiers: [],
      categories: [],
      arguments: [],
      annotations:[],
      data: []
    }])
  })

  it('allows for value', () => {
    const items = [{text: 'testa', value: 'a'}, {text: 'testb', value: 'b'}]
    const grammar = <list items={items} />

    const options = compileAndTraverse(grammar, 'testb')
    expect(options).to.eql([{
      text: '',
      words: [{text: 'testb', input: true}],
      result: 'b',
      score: 1,
      qualifiers: [],
      categories: [],
      arguments: [],
      annotations:[],
      data: []
    }])
  })

  it('allows for value with contain', () => {
    const items = [{text: 'testa', value: 'a'}, {text: 'testb', value: 'b'}]
    const grammar = <list items={items} strategy='contain' />

    const options = compileAndTraverse(grammar, 'b')
    expect(options).to.eql([{
      text: null,
      words: [{text: 'test', input: false}, {text: 'b', input: true}],
      result: 'b',
      score: 0.6,
      qualifiers: [],
      categories: [],
      arguments: [],
      annotations:[],
      data: []
    }])
  })

  it('allows for value override', () => {
    const items = ['testa', {text: 'testb', value: 'b'}, {text: 'testc'}]
    const grammar = <list items={items} value='override' />

    const options = compileAndTraverse(grammar, '')
    expect(options).to.eql([{
      text: null,
      words: [{text: 'testa', input: false}],
      result: 'override',
      score: 1,
      qualifiers: [],
      categories: [],
      arguments: [],
      annotations:[],
      data: []
    }, {
      text: null,
      words: [{text: 'testb', input: false}],
      result: 'override',
      score: 1,
      qualifiers: [],
      categories: [],
      arguments: [],
      annotations:[],
      data: []
    }, {
      text: null,
      words: [{text: 'testc', input: false}],
      result: 'override',
      score: 1,
      qualifiers: [],
      categories: [],
      arguments: [],
      annotations:[],
      data: []
    }])
  })

  it('outputs an addition (plural)', () => {
    const items = [
      {
        text: 'testa',
        qualifiers: ['a', 'b'],
        categories: ['a', 'b'],
        arguments: ['a', 'b'],
        annotations: ['a', 'b']
      },
      'testb'
    ]
    const grammar = <list items={items} />

    const options = compileAndTraverse(grammar, 'testa')
    expect(options).to.eql([{
      text: '',
      words: [{text: 'testa', input: true}],
      result: undefined,
      score: 1,
      qualifiers: [
        {value: 'a', start: 0, end: 1},
        {value: 'b', start: 0, end: 1}
      ],
      arguments: [
        {value: 'a', start: 0, end: 1},
        {value: 'b', start: 0, end: 1}
      ],
      annotations: [
        {value: 'a', start: 0, end: 1},
        {value: 'b', start: 0, end: 1}
      ],
      categories: [
        {value: 'a', start: 0, end: 1},
        {value: 'b', start: 0, end: 1}
      ],
      data: []
    }])
  })

  it('outputs an addition (singular)', () => {
    const items = [
      {
        text: 'testa',
        qualifier: 'a',
        annotation: 'a',
        category: 'a',
        argument: 'a'
      },
      'testb'
    ]
    const grammar = <list items={items} />

    const options = compileAndTraverse(grammar, 'testa')
    expect(options).to.eql([{
      text: '',
      words: [{text: 'testa', input: true}],
      result: undefined,
      score: 1,
      qualifiers: [
        {value: 'a', start: 0, end: 1}
      ],
      arguments: [
        {value: 'a', start: 0, end: 1}
      ],
      annotations: [
        {value: 'a', start: 0, end: 1}
      ],
      categories: [
        {value: 'a', start: 0, end: 1}
      ],
      data: []
    }])
  })

  it('respects synonymGroup', () => {
    const grammar = <list items={[
      {text: 'testa', value: 'a', synonymGroup: 0},
      {text: 'testb', value: 'b', synonymGroup: 1},
      {text: 'testc', value: 'c', synonymGroup: 1}
    ]} unique='array' />

    const options = compileAndTraverse(grammar, '')
    expect(options).to.eql([{
      text: null,
      words: [{text: 'testa', input: false}],
      result: 'a',
      score: 1,
      categories: [],
      arguments: [],
      qualifiers: [],
      annotations: [],
      data: []
    }, {
      text: null,
      words: [{text: 'testb', input: false}],
      result: 'b',
      score: 1,
      categories: [],
      arguments: [],
      qualifiers: [],
      annotations: [],
      data: []
    }])
  })

  it('respects synonymGroups', () => {
    const grammar = <list items={[
      {text: 'testa', value: 'a', synonymGroups: [0, 1]},
      {text: 'testb', value: 'b', synonymGroups: [1, 2]},
      {text: 'testc', value: 'c', synonymGroups: [0]}
    ]} unique='array' />

    const options = compileAndTraverse(grammar, '')
    expect(options).to.eql([{
      text: null,
      words: [{text: 'testa', input: false}],
      result: 'a',
      score: 1,
      categories: [],
      arguments: [],
      qualifiers: [],
      annotations: [],
      data: []
    }, {
      text: null,
      words: [{text: 'testb', input: false}],
      result: 'b',
      score: 1,
      categories: [],
      arguments: [],
      qualifiers: [],
      annotations: [],
      data: []
    }])
  })

  it('unique=false does not suggests identical value options', () => {
    const grammar = <list items={[
      {text: 'testa', value: 'test'},
      {text: 'testb', value: 'test'}
    ]} />

    const options = compileAndTraverse(grammar, '')
    expect(options).to.eql([{
      text: null,
      words: [{text: 'testa', input: false}],
      result: 'test',
      score: 1,
      categories: [],
      arguments: [],
      qualifiers: [],
      annotations: [],
      data: []
    }, {
      text: null,
      words: [{text: 'testb', input: false}],
      result: 'test',
      score: 1,
      categories: [],
      arguments: [],
      qualifiers: [],
      annotations: [],
      data: []
    }])
  })

  it('unique=true does not suggest identical value options', () => {
    const grammar = <list items={[
      {text: 'testa', value: 'test'},
      {text: 'testb', value: 'test'}
    ]} unique />

    const options = compileAndTraverse(grammar, '')
    expect(options).to.eql([{
      text: null,
      words: [{text: 'testa', input: false}],
      result: 'test',
      score: 1,
      categories: [],
      arguments: [],
      qualifiers: [],
      annotations: [],
      data: []
    }])
  })

  it('unique=true does not suggest identical value options using the unique symbol', () => {
    const grammar = <list items={[
      {text: 'testa', value: {val: 1, [unique]: 'same'}},
      {text: 'testb', value: {val: 2, [unique]: 'same'}}
    ]} unique />

    const options = compileAndTraverse(grammar, '')
    expect(options).to.eql([{
      text: null,
      words: [{text: 'testa', input: false}],
      result: {val: 1},
      score: 1,
      categories: [],
      arguments: [],
      qualifiers: [],
      annotations: [],
      data: []
    }])
  })

  it('unique=array does not suggest multiples if all have been suggested', () => {
    const grammar = <list items={[
      {text: 'testa', value: [1, 2]},
      {text: 'testb', value: [1]}
    ]} unique='array' />

    const options = compileAndTraverse(grammar, '')
    expect(options).to.eql([{
      text: null,
      words: [{text: 'testa', input: false}],
      result: [1, 2],
      score: 1,
      categories: [],
      arguments: [],
      qualifiers: [],
      annotations: [],
      data: []
    }])
  })

  it('unique=array does suggest multiples if some have not been suggested', () => {
    const grammar = <list items={[
      {text: 'testa', value: [1, 2]},
      {text: 'testb', value: [1, 3]}
    ]} unique='array' />

    const options = compileAndTraverse(grammar, '')
    expect(options).to.eql([{
      text: null,
      words: [{text: 'testa', input: false}],
      result: [1, 2],
      score: 1,
      categories: [],
      arguments: [],
      qualifiers: [],
      annotations: [],
      data: []
    }, {
      text: null,
      words: [{text: 'testb', input: false}],
      result: [1, 3],
      score: 1,
      categories: [],
      arguments: [],
      qualifiers: [],
      annotations: [],
      data: []
    }])
  })

  it('supports data', () => {
    const grammar = <list items={[
      {text: 'testa', value: 'test', data: 2},
      {text: 'testb', value: 'test', data: 3}
    ]} />

    const options = compileAndTraverse(grammar, 'testa')
    expect(options).to.eql([{
      text: '',
      words: [{text: 'testa', input: true}],
      result: 'test',
      score: 1,
      categories: [],
      arguments: [],
      qualifiers: [],
      annotations: [],
      data: [2]
    }])
  })
})
