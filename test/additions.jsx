/** @jsx createElement */
/* eslint-env mocha */

import createElement from '../src/element'
import {compileAndTraverse, text} from './_util'
import {expect} from 'chai'

describe('additions', () => {
  it('are exported from elements', () => {
    const grammar = <literal
      text='test'
      annotations={['a', 'b']}
      categories={['a', 'b']}
      qualifiers={['a', 'b']}
      arguments={['a', 'b']} />

    const options = compileAndTraverse(grammar, 'te')
    expect(options).to.have.length(1)
    expect(text(options[0])).to.equal('test')
    expect(options[0].annotations).to.eql([
      {value: 'a', start: 0, end: 2},
      {value: 'b', start: 0, end: 2}
    ])
    expect(options[0].categories).to.eql([
      {value: 'a', start: 0, end: 2},
      {value: 'b', start: 0, end: 2}
    ])
    expect(options[0].qualifiers).to.eql([
      {value: 'a', start: 0, end: 2},
      {value: 'b', start: 0, end: 2}
    ])
    expect(options[0].arguments).to.eql([
      {value: 'a', start: 0, end: 2},
      {value: 'b', start: 0, end: 2}
    ])
  })

  it('are joined by sequences', () => {
    const grammar = (
      <sequence>
        <literal
          text='te'
          annotations={['a', 'b']}
          categories={['a', 'b']}
          qualifiers={['a', 'b']}
          arguments={['a', 'b']} />
        <literal
          text='st'
          annotation='c'
          category='c'
          qualifier='c'
          argument='c' />
      </sequence>
    )

    const options = compileAndTraverse(grammar, '')
    expect(options).to.have.length(1)
    expect(text(options[0])).to.equal('test')
    expect(options[0].annotations).to.eql([
      {value: 'a', start: 0, end: 1},
      {value: 'b', start: 0, end: 1},
      {value: 'c', start: 1, end: 2}
    ])
    expect(options[0].qualifiers).to.eql([
      {value: 'a', start: 0, end: 1},
      {value: 'b', start: 0, end: 1},
      {value: 'c', start: 1, end: 2}
    ])
    expect(options[0].categories).to.eql([
      {value: 'a', start: 0, end: 1},
      {value: 'b', start: 0, end: 1},
      {value: 'c', start: 1, end: 2}
    ])
    expect(options[0].arguments).to.eql([
      {value: 'a', start: 0, end: 1},
      {value: 'b', start: 0, end: 1},
      {value: 'c', start: 1, end: 2}
    ])
  })
  
  it('can be nested', () => {
    const grammar = (
      <choice
        annotation='a'
        category='a'
        qualifier='a'
        argument='a'>
        <literal text='test'
          annotations={['b', 'c']}
          categories={['b', 'c']}
          qualifiers={['b', 'c']}
          arguments={['b', 'c']} />
      </choice>
    )

    const options = compileAndTraverse(grammar, 'test')
    expect(options).to.have.length(1)
    expect(text(options[0])).to.equal('test')
    expect(options[0].annotations).to.eql([
      {value: 'a', start: 0, end: 1},
      {value: 'b', start: 0, end: 1},
      {value: 'c', start: 0, end: 1}
    ])
    expect(options[0].qualifiers).to.eql([
      {value: 'a', start: 0, end: 1},
      {value: 'b', start: 0, end: 1},
      {value: 'c', start: 0, end: 1}
    ])
    expect(options[0].categories).to.eql([
      {value: 'a', start: 0, end: 1},
      {value: 'b', start: 0, end: 1},
      {value: 'c', start: 0, end: 1}
    ])
    expect(options[0].arguments).to.eql([
      {value: 'a', start: 0, end: 1},
      {value: 'b', start: 0, end: 1},
      {value: 'c', start: 0, end: 1}
    ])
  })

  it('are passed through by repeats', () => {
    const grammar = (
      <repeat>
        <placeholder text='place'>
          <literal
            text='test'
            annotations={['a']}
            categories={['a']}
            qualifiers={['a']}
            arguments={['a']}
            />
        </placeholder>
      </repeat>
    )

    const options = compileAndTraverse(grammar, 'testte')
    expect(options).to.have.length(1)
    expect(text(options[0])).to.equal('testtest')
    expect(options[0].qualifiers).to.eql([
      {value: 'a', start: 0, end: 1},
      {value: 'a', start: 1, end: 3}
    ])
    expect(options[0].annotations).to.eql([
      {value: 'a', start: 0, end: 1},
      {value: 'a', start: 1, end: 3}
    ])
    expect(options[0].categories).to.eql([
      {value: 'a', start: 0, end: 1},
      {value: 'a', start: 1, end: 3}
    ])
    expect(options[0].arguments).to.eql([
      {value: 'a', start: 0, end: 1},
      {value: 'a', start: 1, end: 3}
    ])
  })
})
