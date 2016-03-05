/* eslint-env mocha */

import _ from 'lodash'
import element from '../src/element'
import {reconcileAndTraverse} from './_util'

import { expect } from 'chai'

describe('sequence', () => {
  it('puts two elements in order', () => {
    const grammar = (
      <sequence>
        <literal text='super' />
        <literal text='man' />
      </sequence>
    )
    const options = reconcileAndTraverse(grammar, '')

    expect(options).to.eql([{
      text: null,
      words: [{text: 'super', input: false}, {text: 'man', input: false}],
      result: {},
      score: 1,
      qualifiers: []
    }]);
  })

  it('handles an optional child', () => {
    const grammar = (
      <sequence>
        <literal text='super' />
        <literal text=' ' optional />
        <literal text='man' />
      </sequence>
    )
    const options = reconcileAndTraverse(grammar, '')

    expect(options).to.eql([{
      text: null,
      words: [
        {text: 'super', input: false},
        {text: 'man', input: false}
      ],
      result: {},
      score: 1,
      qualifiers: []
    }, {
      text: null,
      words: [
        {text: 'super', input: false},
        {text: ' ', input: false},
        {text: 'man', input: false}
      ],
      result: {},
      score: 1,
      qualifiers: []
    }]);
  })

  it('handles an ellipsis', () => {
    const grammar = (
      <sequence>
        <literal text='super' ellipsis />
        <literal text='man' />
      </sequence>
    )
    let options

    options = reconcileAndTraverse(grammar, '')
    expect(options).to.eql([{
      text: null,
      words: [{text: 'super', input: false}],
      result: {},
      score: 1,
      qualifiers: []
    }]);

    options = reconcileAndTraverse(grammar, 'super')
    expect(options).to.eql([{
      text: '',
      words: [{text: 'super', input: true}],
      result: {},
      score: 1,
      qualifiers: []
    }, {
      text: null,
      words: [{text: 'super', input: true}, {text: 'man', input: false}],
      result: {},
      score: 1,
      qualifiers: []
    }]);

    options = reconcileAndTraverse(grammar, 'superm')
    expect(options).to.eql([{
      text: null,
      words: [
        {text: 'super', input: true},
        {text: 'm', input: true},
        {text: 'an', input: false}
      ],
      result: {},
      score: 1,
      qualifiers: []
    }]);
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

    options = reconcileAndTraverse(grammar, '')
    expect(options).to.eql([{
      text: null,
      words: [{text: 'super', input: false}, {text: 'man', input: false}],
      result: {},
      score: 1,
      qualifiers: []
    }]);

    options = reconcileAndTraverse(grammar, 'super')
    expect(options).to.eql([{
      text: null,
      words: [{text: 'super', input: true}, {text: 'man', input: false}],
      result: {},
      score: 1,
      qualifiers: []
    }]);

    options = reconcileAndTraverse(grammar, 'superman')
    expect(options).to.eql([{
      text: '',
      words: [
        {text: 'super', input: true},
        {text: 'man', input: true},
      ],
      result: {},
      score: 1,
      qualifiers: []
    }, {
      text: null,
      words: [
        {text: 'super', input: true},
        {text: 'man', input: true},
        {text: 'rocks', input: false}
      ],
      result: {},
      score: 1,
      qualifiers: []
    }]);

    options = reconcileAndTraverse(grammar, 'supermanr')
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
      qualifiers: []
    }]);
  })

  it('handles an ellipsis that is optional', () => {
    const grammar = (
      <sequence>
        <literal text='the' />
        <literal text='super' ellipsis optional  />
        <literal text='man' />
      </sequence>
    )
    let options

    options = reconcileAndTraverse(grammar, '')
    expect(options).to.eql([{
      text: null,
      words: [{text: 'the', input: false}],
      result: {},
      score: 1,
      qualifiers: []
    }, {
      text: null,
      words: [{text: 'the', input: false}, {text: 'super', input: false}],
      result: {},
      score: 1,
      qualifiers: []
    }]);

    options = reconcileAndTraverse(grammar, 'the')
    expect(options).to.eql([{
      text: '',
      words: [{text: 'the', input: true}],
      result: {},
      score: 1,
      qualifiers: []
    }, {
      text: null,
      words: [{text: 'the', input: true}, {text: 'man', input: false}],
      result: {},
      score: 1,
      qualifiers: []
    }, {
      text: null,
      words: [{text: 'the', input: true}, {text: 'super', input: false}],
      result: {},
      score: 1,
      qualifiers: []
    }]);

    options = reconcileAndTraverse(grammar, 'thesuper')
    expect(options).to.eql([{
      text: '',
      words: [{text: 'the', input: true}, {text: 'super', input: true}],
      result: {},
      score: 1,
      qualifiers: []
    }, {
      text: null,
      words: [
        {text: 'the', input: true},
        {text: 'super', input: true},
        {text: 'man', input: false}
      ],
      result: {},
      score: 1,
      qualifiers: []
    }]);

    options = reconcileAndTraverse(grammar, 'thesuperm')
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
      qualifiers: []
    }]);
  })

  it('does not double output if an optional follows an ellipsis', () => {
    const grammar = (
      <sequence>
        <literal text='the' />
        <literal text='super' ellipsis optional  />
        <literal text='man' optional />
        <literal text='rocks' />
      </sequence>
    )
    let options

    options = reconcileAndTraverse(grammar, '')
    expect(options).to.eql([{
      text: null,
      words: [{text: 'the', input: false}],
      result: {},
      score: 1,
      qualifiers: []
    }, {
      text: null,
      words: [{text: 'the', input: false}, {text: 'super', input: false}],
      result: {},
      score: 1,
      qualifiers: []
    }]);

    options = reconcileAndTraverse(grammar, 'the')
    expect(options).to.eql([{
      text: '',
      words: [{text: 'the', input: true}],
      result: {},
      score: 1,
      qualifiers: []
    }, {
      text: null,
      words: [{text: 'the', input: true}, {text: 'rocks', input: false}],
      result: {},
      score: 1,
      qualifiers: []
    }, {
      text: null,
      words: [
        {text: 'the', input: true},
        {text: 'man', input: false},
        {text: 'rocks', input: false}
      ],
      result: {},
      score: 1,
      qualifiers: []
    }, {
      text: null,
      words: [{text: 'the', input: true}, {text: 'super', input: false}],
      result: {},
      score: 1,
      qualifiers: []
    }]);
    options = reconcileAndTraverse(grammar, 'thesuper')
    expect(options).to.eql([{
      text: '',
      words: [{text: 'the', input: true}, {text: 'super', input: true}],
      result: {},
      score: 1,
      qualifiers: []
    }, {
      text: null,
      words: [
        {text: 'the', input: true},
        {text: 'super', input: true},
        {text: 'rocks', input: false}
      ],
      result: {},
      score: 1,
      qualifiers: []
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
      qualifiers: []
    }]);

    options = reconcileAndTraverse(grammar, 'thesuperm')
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
      qualifiers: []
    }]);
  })

  it('does not double output if an optional ellipsis follows an ellipsis', () => {
    const grammar = (
      <sequence>
        <literal text='the' />
        <literal text='super' ellipsis optional  />
        <literal text='man' ellipsis optional />
        <literal text='rocks' />
      </sequence>
    )
    let options

    options = reconcileAndTraverse(grammar, '')
    expect(options).to.eql([{
      text: null,
      words: [{text: 'the', input: false}],
      result: {},
      score: 1,
      qualifiers: []
    }, {
      text: null,
      words: [{text: 'the', input: false}, {text: 'super', input: false}],
      result: {},
      score: 1,
      qualifiers: []
    }]);

    options = reconcileAndTraverse(grammar, 'the')
    expect(options).to.eql([{
      text: '',
      words: [{text: 'the', input: true}],
      result: {},
      score: 1,
      qualifiers: []
    }, {
      text: null,
      words: [{text: 'the', input: true}, {text: 'rocks', input: false}],
      result: {},
      score: 1,
      qualifiers: []
    }, {
      text: null,
      words: [{text: 'the', input: true}, {text: 'man', input: false}],
      result: {},
      score: 1,
      qualifiers: []
    }, {
      text: null,
      words: [{text: 'the', input: true}, {text: 'super', input: false}],
      result: {},
      score: 1,
      qualifiers: []
    }]);

    options = reconcileAndTraverse(grammar, 'thesuper')
    expect(options).to.eql([{
      text: '',
      words: [{text: 'the', input: true}, {text: 'super', input: true}],
      result: {},
      score: 1,
      qualifiers: []
    }, {
      text: null,
      words: [
        {text: 'the', input: true},
        {text: 'super', input: true},
        {text: 'rocks', input: false}
      ],
      result: {},
      score: 1,
      qualifiers: []
    }, {
      text: null,
      words: [
        {text: 'the', input: true},
        {text: 'super', input: true},
        {text: 'man', input: false}
      ],
      result: {},
      score: 1,
      qualifiers: []
    }]);

    options = reconcileAndTraverse(grammar, 'thesuperm')
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
      qualifiers: []
    }]);

    options = reconcileAndTraverse(grammar, 'thesuperman')
    expect(options).to.eql([{
      text: '',
      words: [
        {text: 'the', input: true},
        {text: 'super', input: true},
        {text: 'man', input: true}
      ],
      result: {},
      score: 1,
      qualifiers: []
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
      qualifiers: []
    }]);

    options = reconcileAndTraverse(grammar, 'thesupermanr')
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
      qualifiers: []
    }]);
  })

  it('handles an optional child that is preferred', () => {
    const grammar = (
      <sequence>
        <literal text='super' />
        <literal text=' ' optional preferred />
        <literal text='man' />
      </sequence>
    )
    const options = reconcileAndTraverse(grammar, '')

    expect(options).to.eql([{
      text: null,
      words: [
        {text: 'super', input: false},
        {text: ' ', input: false},
        {text: 'man', input: false},
      ],
      result: {},
      score: 1,
      qualifiers: []
    }, {
      text: null,
      words: [
        {text: 'super', input: false},
        {text: 'man', input: false}
      ],
      result: {},
      score: 1,
      qualifiers: []
    }]);
  })

  it('handles an optional child that is limited', () => {
    const grammar = (
      <sequence>
        <literal text='super' />
        <literal text=' ' optional limited />
        <literal text='man' />
      </sequence>
    )
    const options = reconcileAndTraverse(grammar, '')

    expect(options).to.eql([{
      text: null,
      words: [
        {text: 'super', input: false},
        {text: 'man', input: false},
      ],
      result: {},
      score: 1,
      qualifiers: []
    }]);
  })

  it('handles an optional child that is preferred and limited', () => {
    const grammar = (
      <sequence>
        <literal text='super' />
        <literal text=' ' optional preferred limited />
        <literal text='man' />
      </sequence>
    )
    const options = reconcileAndTraverse(grammar, '')

    expect(options).to.eql([{
      text: null,
      words: [
        {text: 'super', input: false},
        {text: ' ', input: false},
        {text: 'man', input: false},
      ],
      result: {},
      score: 1,
      qualifiers: []
    }]);
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
    const options = reconcileAndTraverse(grammar, 'superm')

    expect(options).to.eql([{
      text: null,
      words: [
        {text: 'super', input: true},
        {text: 'm', input: true},
        {text: 'an', input: false},
        {text: 'again', input: false},
      ],
      result: {},
      score: 1,
      qualifiers: []
    }]);
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
    const options = reconcileAndTraverse(grammar, 'supermanagainret')

    expect(options).to.eql([{
      text: null,
      words: [
        {text: 'super', input: true},
        {text: 'man', input: true},
        {text: 'again', input: true},
        {text: 'ret', input: true},
        {text: 'urns', input: false},
      ],
      result: {},
      score: options[0].score,
      qualifiers: []
    }]);
  })

  it('does not take an optional childs value', () => {
    const grammar = (
      <sequence>
        <literal text='super' />
        <literal text=' ' value='someValue' id='opt' optional />
        <literal text='man' />
      </sequence>
    )
    const options = reconcileAndTraverse(grammar, '')

    expect(options).to.eql([{
      text: null,
      words: [
        {text: 'super', input: false},
        {text: 'man', input: false}
      ],
      result: {},
      score: 1,
      qualifiers: []
    }, {
      text: null,
      words: [
        {text: 'super', input: false},
        {text: ' ', input: false},
        {text: 'man', input: false}
      ],
      result: {opt: 'someValue'},
      score: 1,
      qualifiers: []
    }]);
  })

  it('can set a value to the result', () => {
    const grammar = (
      <sequence value='testValue'>
        <literal text='super' />
        <literal text='man' />
      </sequence>
    )
    const options = reconcileAndTraverse(grammar, '')

    expect(options).to.eql([{
      text: null,
      words: [
        {text: 'super', input: false},
        {text: 'man', input: false}
      ],
      result: 'testValue',
      score: 1,
      qualifiers: []
    }]);
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

    const options = reconcileAndTraverse(grammar, '')
    expect(options).to.eql([{
      text: null,
      words: [
        {text: 'super', input: false},
        {text: 'man', input: false},
        {text: 'rocks', input: false}
      ],
      result: {desc: 'super', noun: 'man', adj: 'rocks'},
      score: 1,
      qualifiers: []
    }]);
  })

  it('will assign for non-object merge results', () => {
    const grammar = (
      <sequence>
        <literal text='super' />
        <literal text='man' value='man' merge />
      </sequence>
    )
    const options = reconcileAndTraverse(grammar, '')
    expect(options).to.eql([{
      text: null,
      words: [
        {text: 'super', input: false},
        {text: 'man', input: false}
      ],
      result: 'man',
      score: 1,
      qualifiers: []
    }]);
  })

  it('will merge results in for optionals', () => {
    const grammar = (
      <sequence>
        <literal text='super' />
        <literal text='man' value='man' optional merge />
      </sequence>
    )
    const options = reconcileAndTraverse(grammar, '')
    expect(options).to.eql([{
      text: null,
      words: [
        {text: 'super', input: false}
      ],
      result: {},
      score: 1,
      qualifiers: []
    }, {
      text: null,
      words: [
        {text: 'super', input: false},
        {text: 'man', input: false}
      ],
      result: 'man',
      score: 1,
      qualifiers: []
    }]);
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

    options = reconcileAndTraverse(grammar, 'testa')
    expect(options).to.eql([{
      text: "",
      words: [
        {text: 'test', input: true},
        {text: 'a', input: true}
      ],
      result: {test: 1},
      score: 1,
      qualifiers: []
    }]);


    options = reconcileAndTraverse(grammar, 'atest')
    expect(options).to.eql([{
      text: "",
      words: [
        {text: 'a', input: true},
        {text: 'test', input: true}
      ],
      result: {test: 2},
      score: 1,
      qualifiers: []
    }]);


    options = reconcileAndTraverse(grammar, 'testatest')
    expect(options).to.eql([]);
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

    options = reconcileAndTraverse(grammar, 'testa')
    expect(options).to.eql([{
      text: "",
      words: [
        {text: 'test', input: true},
        {text: 'a', input: true}
      ],
      result: {test: 1},
      score: 1,
      qualifiers: []
    }]);

    options = reconcileAndTraverse(grammar, 'atest')
    expect(options).to.eql([{
      text: "",
      words: [
        {text: 'a', input: true},
        {text: 'test', input: true}
      ],
      result: {test: 2},
      score: 1,
      qualifiers: []
    }]);

    options = reconcileAndTraverse(grammar, 'testatest')
    expect(options).to.eql([]);
  })
})
