/** @jsx createElement */
/* eslint-env mocha */

import createElement from '../src/element'
import {compileAndTraverse} from './_util'

import { expect } from 'chai'

describe('sequence', () => {
  it('puts two elements in order', () => {
    const grammar = (
      <sequence>
        <literal text='super' />
        <literal text='man' />
      </sequence>
    )
    const options = compileAndTraverse(grammar, '')

    expect(options).to.eql([{
      text: null,
      words: [{text: 'super', input: false}, {text: 'man', input: false}],
      result: {},
      score: 1,
      qualifiers: [],
      categories: [],
      arguments: [],
      annotations:[],
      data: []
    }])
  })

  it('handles an optional child', () => {
    const grammar = (
      <sequence>
        <literal text='super' />
        <literal text=' ' optional />
        <literal text='man' />
      </sequence>
    )
    const options = compileAndTraverse(grammar, '')

    expect(options).to.eql([{
      text: null,
      words: [
        {text: 'super', input: false},
        {text: 'man', input: false}
      ],
      result: {},
      score: 1,
      categories: [],
      arguments: [],
      qualifiers: [],
      annotations:[],
      data: []
    }, {
      text: null,
      words: [
        {text: 'super', input: false},
        {text: ' ', input: false},
        {text: 'man', input: false}
      ],
      result: {},
      score: 1,
      categories: [],
      arguments: [],
      qualifiers: [],
      annotations:[],
      data: []
    }])
  })

  it('handles an ellipsis', () => {
    const grammar = (
      <sequence>
        <literal text='super' ellipsis />
        <literal text='man' />
      </sequence>
    )
    let options

    options = compileAndTraverse(grammar, '')
    expect(options).to.eql([{
      text: null,
      words: [{text: 'super', input: false}],
      result: {},
      score: 1,
      categories: [],
      arguments: [],
      qualifiers: [],
      annotations:[],
      data: []
    }])

    options = compileAndTraverse(grammar, 'super')
    expect(options).to.eql([{
      text: '',
      words: [{text: 'super', input: true}],
      result: {},
      score: 1,
      qualifiers: [],
      categories: [],
      arguments: [],
      annotations:[],
      data: []
    }, {
      text: null,
      words: [{text: 'super', input: true}, {text: 'man', input: false}],
      result: {},
      score: 1,
      qualifiers: [],
      categories: [],
      arguments: [],
      annotations:[],
      data: []
    }])

    options = compileAndTraverse(grammar, 'superm')
    expect(options).to.eql([{
      text: null,
      words: [
        {text: 'super', input: true},
        {text: 'm', input: true},
        {text: 'an', input: false}
      ],
      result: {},
      score: 1,
      qualifiers: [],
      categories: [],
      arguments: [],
      annotations:[],
      data: []
    }])
  })

  it('does not output an ellipsis for the last child', () => {
    const grammar = (
      <sequence>
        <literal text='super' />
        <literal text='man' ellipsis />
        <literal text='rocks' ellipsis />
      </sequence>
    )
    let options

    options = compileAndTraverse(grammar, '')
    expect(options).to.eql([{
      text: null,
      words: [{text: 'super', input: false}, {text: 'man', input: false}],
      result: {},
      score: 1,
      qualifiers: [],
      categories: [],
      arguments: [],
      annotations:[],
      data: []
    }])

    options = compileAndTraverse(grammar, 'super')
    expect(options).to.eql([{
      text: null,
      words: [{text: 'super', input: true}, {text: 'man', input: false}],
      result: {},
      score: 1,
      qualifiers: [],
      categories: [],
      arguments: [],
      annotations:[],
      data: []
    }])

    options = compileAndTraverse(grammar, 'superman')
    expect(options).to.eql([{
      text: '',
      words: [
        {text: 'super', input: true},
        {text: 'man', input: true}
      ],
      result: {},
      score: 1,
      qualifiers: [],
      categories: [],
      arguments: [],
      annotations:[],
      data: []
    }, {
      text: null,
      words: [
        {text: 'super', input: true},
        {text: 'man', input: true},
        {text: 'rocks', input: false}
      ],
      result: {},
      score: 1,
      qualifiers: [],
      categories: [],
      arguments: [],
      annotations:[],
      data: []
    }])

    options = compileAndTraverse(grammar, 'supermanr')
    expect(options).to.eql([{
      text: null,
      words: [
        {text: 'super', input: true},
        {text: 'man', input: true},
        {text: 'r', input: true},
        {text: 'ocks', input: false}
      ],
      result: {},
      score: 1,
      qualifiers: [],
      categories: [],
      arguments: [],
      annotations:[],
      data: []
    }])
  })

  it('handles an ellipsis that is optional', () => {
    const grammar = (
      <sequence>
        <literal text='the' />
        <literal text='super' ellipsis optional />
        <literal text='man' />
      </sequence>
    )
    let options

    options = compileAndTraverse(grammar, '')
    expect(options).to.eql([{
      text: null,
      words: [{text: 'the', input: false}],
      result: {},
      score: 1,
      qualifiers: [],
      categories: [],
      arguments: [],
      annotations:[],
      data: []
    }, {
      text: null,
      words: [{text: 'the', input: false}, {text: 'super', input: false}],
      result: {},
      score: 1,
      qualifiers: [],
      categories: [],
      arguments: [],
      annotations:[],
      data: []
    }])

    options = compileAndTraverse(grammar, 'the')
    expect(options).to.eql([{
      text: '',
      words: [{text: 'the', input: true}],
      result: {},
      score: 1,
      qualifiers: [],
      categories: [],
      arguments: [],
      annotations:[],
      data: []
    }, {
      text: null,
      words: [{text: 'the', input: true}, {text: 'man', input: false}],
      result: {},
      score: 1,
      qualifiers: [],
      categories: [],
      arguments: [],
      annotations:[],
      data: []
    }, {
      text: null,
      words: [{text: 'the', input: true}, {text: 'super', input: false}],
      result: {},
      score: 1,
      qualifiers: [],
      categories: [],
      arguments: [],
      annotations:[],
      data: []
    }])

    options = compileAndTraverse(grammar, 'thesuper')
    expect(options).to.eql([{
      text: '',
      words: [{text: 'the', input: true}, {text: 'super', input: true}],
      result: {},
      score: 1,
      categories: [],
      arguments: [],
      qualifiers: [],
      annotations:[],
      data: []
    }, {
      text: null,
      words: [
        {text: 'the', input: true},
        {text: 'super', input: true},
        {text: 'man', input: false}
      ],
      result: {},
      score: 1,
      categories: [],
      arguments: [],
      qualifiers: [],
      annotations:[],
      data: []
    }])

    options = compileAndTraverse(grammar, 'thesuperm')
    expect(options).to.eql([{
      text: null,
      words: [
        {text: 'the', input: true},
        {text: 'super', input: true},
        {text: 'm', input: true},
        {text: 'an', input: false}
      ],
      result: {},
      score: 1,
      categories: [],
      arguments: [],
      qualifiers: [],
      annotations:[],
      data: []
    }])
  })

  it('does not double output if an optional follows an ellipsis', () => {
    const grammar = (
      <sequence>
        <literal text='the' />
        <literal text='super' ellipsis optional />
        <literal text='man' optional />
        <literal text='rocks' />
      </sequence>
    )
    let options

    options = compileAndTraverse(grammar, '')
    expect(options).to.eql([{
      text: null,
      words: [{text: 'the', input: false}],
      result: {},
      score: 1,
      qualifiers: [],
      categories: [],
      arguments: [],
      annotations:[],
      data: []
    }, {
      text: null,
      words: [{text: 'the', input: false}, {text: 'super', input: false}],
      result: {},
      score: 1,
      qualifiers: [],
      categories: [],
      arguments: [],
      annotations:[],
      data: []
    }])

    options = compileAndTraverse(grammar, 'the')
    expect(options).to.eql([{
      text: '',
      words: [{text: 'the', input: true}],
      result: {},
      score: 1,
      qualifiers: [],
      categories: [],
      arguments: [],
      annotations:[],
      data: []
    }, {
      text: null,
      words: [{text: 'the', input: true}, {text: 'rocks', input: false}],
      result: {},
      score: 1,
      qualifiers: [],
      categories: [],
      arguments: [],
      annotations:[],
      data: []
    }, {
      text: null,
      words: [
        {text: 'the', input: true},
        {text: 'man', input: false},
        {text: 'rocks', input: false}
      ],
      result: {},
      score: 1,
      qualifiers: [],
      categories: [],
      arguments: [],
      annotations:[],
      data: []
    }, {
      text: null,
      words: [{text: 'the', input: true}, {text: 'super', input: false}],
      result: {},
      score: 1,
      qualifiers: [],
      categories: [],
      arguments: [],
      annotations:[],
      data: []
    }])

    options = compileAndTraverse(grammar, 'thesuper')
    expect(options).to.eql([{
      text: '',
      words: [{text: 'the', input: true}, {text: 'super', input: true}],
      result: {},
      score: 1,
      qualifiers: [],
      categories: [],
      arguments: [],
      annotations:[],
      data: []
    }, {
      text: null,
      words: [
        {text: 'the', input: true},
        {text: 'super', input: true},
        {text: 'rocks', input: false}
      ],
      result: {},
      score: 1,
      categories: [],
      arguments: [],
      qualifiers: [],
      annotations:[],
      data: []
    }, {
      text: null,
      words: [
        {text: 'the', input: true},
        {text: 'super', input: true},
        {text: 'man', input: false},
        {text: 'rocks', input: false}
      ],
      result: {},
      score: 1,
      qualifiers: [],
      categories: [],
      arguments: [],
      annotations:[],
      data: []
    }])

    options = compileAndTraverse(grammar, 'thesuperm')
    expect(options).to.eql([{
      text: null,
      words: [
        {text: 'the', input: true},
        {text: 'super', input: true},
        {text: 'm', input: true},
        {text: 'an', input: false},
        {text: 'rocks', input: false}
      ],
      result: {},
      score: 1,
      categories: [],
      arguments: [],
      qualifiers: [],
      annotations:[],
      data: []
    }])
  })

  it('does not double output if an optional ellipsis follows an ellipsis', () => {
    const grammar = (
      <sequence>
        <literal text='the' />
        <literal text='super' ellipsis optional />
        <literal text='man' ellipsis optional />
        <literal text='rocks' />
      </sequence>
    )
    let options
    /*
      the opt1 opt2 ell2
      the rocks opt1 opt2
      the man opt1
      the super
    */

    options = compileAndTraverse(grammar, '')
    expect(options).to.eql([{
      text: null,
      words: [{text: 'the', input: false}],
      result: {},
      score: 1,
      categories: [],
      arguments: [],
      qualifiers: [],
      annotations:[],
      data: []
    }, {
      text: null,
      words: [{text: 'the', input: false}, {text: 'super', input: false}],
      result: {},
      score: 1,
      qualifiers: [],
      categories: [],
      arguments: [],
      annotations:[],
      data: []
    }])

    options = compileAndTraverse(grammar, 'the')
    expect(options).to.eql([{
      text: '',
      words: [{text: 'the', input: true}],
      result: {},
      score: 1,
      qualifiers: [],
      categories: [],
      arguments: [],
      annotations:[],
      data: []
    }, {
      text: null,
      words: [{text: 'the', input: true}, {text: 'rocks', input: false}],
      result: {},
      score: 1,
      categories: [],
      arguments: [],
      qualifiers: [],
      annotations:[],
      data: []
    }, {
      text: null,
      words: [{text: 'the', input: true}, {text: 'man', input: false}],
      result: {},
      score: 1,
      qualifiers: [],
      categories: [],
      arguments: [],
      annotations:[],
      data: []
    }, {
      text: null,
      words: [{text: 'the', input: true}, {text: 'super', input: false}],
      result: {},
      score: 1,
      qualifiers: [],
      categories: [],
      arguments: [],
      annotations:[],
      data: []
    }])

    options = compileAndTraverse(grammar, 'thesuper')
    expect(options).to.eql([{
      text: '',
      words: [{text: 'the', input: true}, {text: 'super', input: true}],
      result: {},
      score: 1,
      qualifiers: [],
      categories: [],
      arguments: [],
      annotations:[],
      data: []
    }, {
      text: null,
      words: [
        {text: 'the', input: true},
        {text: 'super', input: true},
        {text: 'rocks', input: false}
      ],
      result: {},
      score: 1,
      qualifiers: [],
      categories: [],
      arguments: [],
      annotations:[],
      data: []
    }, {
      text: null,
      words: [
        {text: 'the', input: true},
        {text: 'super', input: true},
        {text: 'man', input: false}
      ],
      result: {},
      score: 1,
      qualifiers: [],
      categories: [],
      arguments: [],
      annotations:[],
      data: []
    }])

    options = compileAndTraverse(grammar, 'thesuperm')
    expect(options).to.eql([{
      text: null,
      words: [
        {text: 'the', input: true},
        {text: 'super', input: true},
        {text: 'm', input: true},
        {text: 'an', input: false}
      ],
      result: {},
      score: 1,
      qualifiers: [],
      categories: [],
      arguments: [],
      annotations:[],
      data: []
    }])

    options = compileAndTraverse(grammar, 'thesuperman')
    expect(options).to.eql([{
      text: '',
      words: [
        {text: 'the', input: true},
        {text: 'super', input: true},
        {text: 'man', input: true}
      ],
      result: {},
      score: 1,
      qualifiers: [],
      categories: [],
      arguments: [],
      annotations:[],
      data: []
    }, {
      text: null,
      words: [
        {text: 'the', input: true},
        {text: 'super', input: true},
        {text: 'man', input: true},
        {text: 'rocks', input: false}
      ],
      result: {},
      score: 1,
      categories: [],
      arguments: [],
      qualifiers: [],
      annotations:[],
      data: []
    }])

    options = compileAndTraverse(grammar, 'thesupermanr')
    expect(options).to.eql([{
      text: null,
      words: [
        {text: 'the', input: true},
        {text: 'super', input: true},
        {text: 'man', input: true},
        {text: 'r', input: true},
        {text: 'ocks', input: false}
      ],
      result: {},
      score: 1,
      qualifiers: [],
      categories: [],
      arguments: [],
      annotations:[],
      data: []
    }])
  })

  it('handles an optional child that is preferred', () => {
    const grammar = (
      <sequence>
        <literal text='super' />
        <literal text=' ' optional preferred />
        <literal text='man' />
      </sequence>
    )
    const options = compileAndTraverse(grammar, '')

    expect(options).to.eql([{
      text: null,
      words: [
        {text: 'super', input: false},
        {text: ' ', input: false},
        {text: 'man', input: false}
      ],
      result: {},
      score: 1,
      categories: [],
      arguments: [],
      qualifiers: [],
      annotations:[],
      data: []
    }, {
      text: null,
      words: [
        {text: 'super', input: false},
        {text: 'man', input: false}
      ],
      result: {},
      score: 1,
      categories: [],
      arguments: [],
      qualifiers: [],
      annotations:[],
      data: []
    }])
  })

  it('handles an optional child that is limited', () => {
    const grammar = (
      <sequence>
        <literal text='super' />
        <literal text=' ' optional limited />
        <literal text='man' />
      </sequence>
    )
    const options = compileAndTraverse(grammar, '')

    expect(options).to.eql([{
      text: null,
      words: [
        {text: 'super', input: false},
        {text: 'man', input: false}
      ],
      result: {},
      score: 1,
      qualifiers: [],
      categories: [],
      arguments: [],
      annotations:[],
      data: []
    }])
  })

  it('handles an optional child that is limited with a list after', () => {
    const grammar = (
      <sequence>
        <literal text='super' />
        <literal text=' ' optional limited />
        <list items={['man', 'maiden']} />
      </sequence>
    )
    const options = compileAndTraverse(grammar, '')

    expect(options).to.eql([{
      text: null,
      words: [
        {text: 'super', input: false},
        {text: 'man', input: false}
      ],
      result: {},
      score: 1,
      qualifiers: [],
      categories: [],
      arguments: [],
      annotations:[],
      data: []
    }, {
      text: null,
      words: [
        {text: 'super', input: false},
        {text: 'maiden', input: false}
      ],
      result: {},
      score: 1,
      qualifiers: [],
      categories: [],
      arguments: [],
      annotations:[],
      data: []
    }])
  })

  it('handles an optional child that is preferred and limited', () => {
    const grammar = (
      <sequence>
        <literal text='super' />
        <literal text=' ' optional preferred limited />
        <literal text='man' />
      </sequence>
    )
    const options = compileAndTraverse(grammar, '')

    expect(options).to.eql([{
      text: null,
      words: [
        {text: 'super', input: false},
        {text: ' ', input: false},
        {text: 'man', input: false}
      ],
      result: {},
      score: 1,
      categories: [],
      arguments: [],
      qualifiers: [],
      annotations:[],
      data: []
    }])
  })

  it('handles an optional child that is a sequence', () => {
    const grammar = (
      <sequence>
        <literal text='super' />
        <sequence optional>
          <literal text='man' />
          <literal text='again' />
        </sequence>
      </sequence>
    )
    const options = compileAndTraverse(grammar, 'superm')

    expect(options).to.eql([{
      text: null,
      words: [
        {text: 'super', input: true},
        {text: 'm', input: true},
        {text: 'an', input: false},
        {text: 'again', input: false}
      ],
      result: {},
      score: 1,
      qualifiers: [],
      categories: [],
      arguments: [],
      annotations:[],
      data: []
    }])
  })

  it('handles an optional child that is a sequence with freetexts', () => {
    const grammar = (
      <sequence>
        <freetext limit={1} />
        <sequence optional>
          <literal text='man' />
          <freetext limit={1} />
          <literal text='returns' />
        </sequence>
      </sequence>
    )
    const options = compileAndTraverse(grammar, 'supermanagainret')

    expect(options).to.eql([{
      text: null,
      words: [
        {text: 'super', input: true},
        {text: 'man', input: true},
        {text: 'again', input: true},
        {text: 'ret', input: true},
        {text: 'urns', input: false}
      ],
      result: {},
      score: options[0].score,
      qualifiers: [],
      categories: [],
      arguments: [],
      annotations:[],
      data: []
    }])
  })

  it('does not take an optional childs value', () => {
    const grammar = (
      <sequence>
        <literal text='super' />
        <literal text=' ' value='someValue' id='opt' optional />
        <literal text='man' />
      </sequence>
    )
    const options = compileAndTraverse(grammar, '')

    expect(options).to.eql([{
      text: null,
      words: [
        {text: 'super', input: false},
        {text: 'man', input: false}
      ],
      result: {},
      score: 1,
      qualifiers: [],
      categories: [],
      arguments: [],
      annotations:[],
      data: []
    }, {
      text: null,
      words: [
        {text: 'super', input: false},
        {text: ' ', input: false},
        {text: 'man', input: false}
      ],
      result: {opt: 'someValue'},
      score: 1,
      qualifiers: [],
      categories: [],
      arguments: [],
      annotations:[],
      data: []
    }])
  })

  it('can set a value to the result', () => {
    const grammar = (
      <sequence value='testValue'>
        <literal text='super' />
        <literal text='man' />
      </sequence>
    )
    const options = compileAndTraverse(grammar, '')

    expect(options).to.eql([{
      text: null,
      words: [
        {text: 'super', input: false},
        {text: 'man', input: false}
      ],
      result: 'testValue',
      score: 1,
      qualifiers: [],
      categories: [],
      arguments: [],
      annotations:[],
      data: []
    }])
  })

  it('will merge results in', () => {
    const grammar = (
      <sequence>
        <literal id='desc' text='super' value='super' />
        <sequence merge='true'>
          <literal id='noun' text='man' value='man' />
          <literal id='adj' text='rocks' value='rocks' />
        </sequence>
      </sequence>
    )

    const options = compileAndTraverse(grammar, '')
    expect(options).to.eql([{
      text: null,
      words: [
        {text: 'super', input: false},
        {text: 'man', input: false},
        {text: 'rocks', input: false}
      ],
      result: {desc: 'super', noun: 'man', adj: 'rocks'},
      score: 1,
      qualifiers: [],
      categories: [],
      arguments: [],
      annotations:[],
      data: []
    }])
  })

  it('will assign for non-object merge results', () => {
    const grammar = (
      <sequence>
        <literal text='super' />
        <literal text='man' value='man' merge />
      </sequence>
    )
    const options = compileAndTraverse(grammar, '')
    expect(options).to.eql([{
      text: null,
      words: [
        {text: 'super', input: false},
        {text: 'man', input: false}
      ],
      result: 'man',
      score: 1,
      qualifiers: [],
      categories: [],
      arguments: [],
      annotations:[],
      data: []
    }])
  })

  it('will merge results in for optionals', () => {
    const grammar = (
      <sequence>
        <literal text='super' />
        <literal text='man' value='man' optional merge />
      </sequence>
    )
    const options = compileAndTraverse(grammar, '')
    expect(options).to.eql([{
      text: null,
      words: [
        {text: 'super', input: false}
      ],
      result: {},
      score: 1,
      qualifiers: [],
      categories: [],
      arguments: [],
      annotations:[],
      data: []
    }, {
      text: null,
      words: [
        {text: 'super', input: false},
        {text: 'man', input: false}
      ],
      result: 'man',
      score: 1,
      qualifiers: [],
      categories: [],
      arguments: [],
      annotations:[],
      data: []
    }])
  })

  it('checks for uniqueness', () => {
    const grammar = (
      <sequence unique>
        <literal text='test' optional id='test' value={1} />
        <literal text='a' />
        <literal text='test' optional id='test' value={2} />
      </sequence>
    )
    let options

    options = compileAndTraverse(grammar, 'testa')
    expect(options).to.eql([{
      text: '',
      words: [
        {text: 'test', input: true},
        {text: 'a', input: true}
      ],
      result: {test: 1},
      score: 1,
      qualifiers: [],
      categories: [],
      arguments: [],
      annotations:[],
      data: []
    }])

    options = compileAndTraverse(grammar, 'atest')
    expect(options).to.eql([{
      text: '',
      words: [
        {text: 'a', input: true},
        {text: 'test', input: true}
      ],
      result: {test: 2},
      score: 1,
      qualifiers: [],
      categories: [],
      arguments: [],
      annotations:[],
      data: []
    }])

    options = compileAndTraverse(grammar, 'testatest')
    expect(options).to.eql([])
  })

  it('allows for uniqueness in merges', () => {
    const grammar = (
      <sequence unique>
        <literal text='test' optional id='test' value={1} />
        <literal text='a' />
        <literal text='test' optional merge value={{test: 2}} />
      </sequence>
    )
    let options

    options = compileAndTraverse(grammar, 'testa')
    expect(options).to.eql([{
      text: '',
      words: [
        {text: 'test', input: true},
        {text: 'a', input: true}
      ],
      result: {test: 1},
      score: 1,
      qualifiers: [],
      categories: [],
      arguments: [],
      annotations:[],
      data: []
    }])

    options = compileAndTraverse(grammar, 'atest')
    expect(options).to.eql([{
      text: '',
      words: [
        {text: 'a', input: true},
        {text: 'test', input: true}
      ],
      result: {test: 2},
      score: 1,
      qualifiers: [],
      categories: [],
      arguments: [],
      annotations:[],
      data: []
    }])

    options = compileAndTraverse(grammar, 'testatest')
    expect(options).to.eql([])
  })
})
