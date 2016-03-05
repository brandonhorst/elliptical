/* eslint-env mocha */

import element from '../src/element'
import {reconcileAndTraverse, text} from './_util'

import {expect} from 'chai'

describe('label', () => {
  it('suppresses with a literal', () => {
    const grammar = (
      <sequence>
        <literal text='a ' id='a' value='a' />
        <label text='test' id='place' suppressEmpty={false}>
          <literal text='literal' value='test' />
        </label>
      </sequence>
    )
    let options

    options = reconcileAndTraverse(grammar, '')
    expect(options).to.have.length(1)
    expect(text(options[0])).to.equal('a test')
    expect(options[0].words[1].placeholder).to.be.true
    expect(options[0].words[1].argument).to.equal('test')
    expect(options[0].result).to.eql({a: 'a'})

    options = reconcileAndTraverse(grammar, 'a')
    expect(options).to.have.length(1)
    expect(text(options[0])).to.equal('a test')
    expect(options[0].words[2].placeholder).to.be.true
    expect(options[0].words[2].argument).to.equal('test')
    expect(options[0].result).to.eql({a: 'a'})

    options = reconcileAndTraverse(grammar, 'a ')
    expect(options).to.have.length(1)
    expect(text(options[0])).to.equal('a literal')
    expect(options[0].result).to.eql({a: 'a', place: 'test'})
    expect(options[0].words[1].placeholder).to.be.undefined
    expect(options[0].words[1].argument).to.equal('test')

    options = reconcileAndTraverse(grammar, 'a l')
    expect(options).to.have.length(1)
    expect(text(options[0])).to.equal('a literal')
    expect(options[0].result).to.eql({a: 'a', place: 'test'})
    expect(options[0].words[1].placeholder).to.be.undefined
    expect(options[0].words[1].argument).to.equal('test')

    options = reconcileAndTraverse(grammar, 'a t')
    expect(options).to.have.length(0)
  })

  it('suppresses empty inputs by default', () => {
    function func (input) {
      if (input === 'v') {
        return [{
          words: [{text: 'value', input: true}],
          remaining: '',
          result: 'test'
        }]
      } else {
        return []
      }
    }

    const grammar = (
      <sequence>
        <literal text='a ' id='a' value='a' />
        <label text='test' id='place'>
          <raw func={func} />
        </label>
      </sequence>
    )
    let options

    options = reconcileAndTraverse(grammar, '')
    expect(options).to.have.length(1)
    expect(text(options[0])).to.equal('a test')
    expect(options[0].result).to.eql({a: 'a'})
    expect(options[0].words[1].placeholder).to.be.true
    expect(options[0].words[1].argument).to.equal('test')

    options = reconcileAndTraverse(grammar, 'a')
    expect(options).to.have.length(1)
    expect(text(options[0])).to.equal('a test')
    expect(options[0].result).to.eql({a: 'a'})
    expect(options[0].words[2].placeholder).to.be.true
    expect(options[0].words[2].argument).to.equal('test')

    options = reconcileAndTraverse(grammar, 'a ')
    expect(options).to.have.length(1)
    expect(text(options[0])).to.equal('a test')
    expect(options[0].result).to.eql({a: 'a'})
    expect(options[0].words[1].placeholder).to.be.true
    expect(options[0].words[1].argument).to.equal('test')

    options = reconcileAndTraverse(grammar, 'a v')
    expect(options).to.have.length(1)
    expect(text(options[0])).to.equal('a value')
    expect(options[0].result).to.eql({a: 'a', place: 'test'})
    expect(options[0].words[1].placeholder).to.be.undefined
    expect(options[0].words[1].argument).to.equal('test')

    options = reconcileAndTraverse(grammar, 'a t')
    expect(options).to.have.length(0)
  })

  it('allows suppressEmpty={false}', () => {
    function func (input) {
      if (input === '') {
        return [{
          words: [{text: 'value', input: true}],
          remaining: '',
          result: 'test'
        }]
      } else {
        return []
      }
    }

    const grammar = (
      <sequence>
        <literal text='a ' id='a' value='a' />
        <label text='test' id='place' suppressEmpty={false}>
          <raw func={func} />
        </label>
      </sequence>
    )
    let options

    options = reconcileAndTraverse(grammar, '')
    expect(options).to.have.length(1)
    expect(text(options[0])).to.equal('a test')
    expect(options[0].result).to.eql({a: 'a'})
    expect(options[0].words[1].placeholder).to.be.true
    expect(options[0].words[1].argument).to.equal('test')

    options = reconcileAndTraverse(grammar, 'a')
    expect(options).to.have.length(1)
    expect(text(options[0])).to.equal('a test')
    expect(options[0].result).to.eql({a: 'a'})
    expect(options[0].words[2].placeholder).to.be.true
    expect(options[0].words[2].argument).to.equal('test')

    options = reconcileAndTraverse(grammar, 'a ')
    expect(options).to.have.length(1)
    expect(text(options[0])).to.equal('a value')
    expect(options[0].result).to.eql({a: 'a', place: 'test'})
    expect(options[0].words[1].placeholder).to.be.undefined
    expect(options[0].words[1].argument).to.equal('test')

    options = reconcileAndTraverse(grammar, 'a t')
    expect(options).to.have.length(0)
  })

  it('handles suppressWhen', () => {
    const grammar = (
      <sequence>
        <literal text='a ' id='a' value='a' />
        <label text='test' id='place' suppressWhen={input => input === 'l'} suppressEmpty={false}>
          <literal text='literal' value='test' />
        </label>
      </sequence>
    )
    let options

    options = reconcileAndTraverse(grammar, '')
    expect(options).to.have.length(1)
    expect(text(options[0])).to.equal('a test')
    expect(options[0].words[1].placeholder).to.be.true
    expect(options[0].words[1].argument).to.equal('test')
    expect(options[0].result).to.eql({a: 'a'})

    options = reconcileAndTraverse(grammar, 'a')
    expect(options).to.have.length(1)
    expect(text(options[0])).to.equal('a test')
    expect(options[0].words[2].placeholder).to.be.true
    expect(options[0].words[2].argument).to.equal('test')
    expect(options[0].result).to.eql({a: 'a'})

    options = reconcileAndTraverse(grammar, 'a ')
    expect(options).to.have.length(1)
    expect(text(options[0])).to.equal('a literal')
    expect(options[0].result).to.eql({a: 'a', place: 'test'})
    expect(options[0].words[1].placeholder).to.be.undefined
    expect(options[0].words[1].argument).to.equal('test')

    options = reconcileAndTraverse(grammar, 'a l')
    expect(options).to.have.length(1)
    expect(text(options[0])).to.equal('a test')
    expect(options[0].result).to.eql({a: 'a'})
    expect(options[0].words[1].placeholder).to.be.true
    expect(options[0].words[1].argument).to.equal('test')

    options = reconcileAndTraverse(grammar, 'a li')
    expect(text(options[0])).to.equal('a literal')
    expect(options[0].result).to.eql({a: 'a', place: 'test'})
    expect(options[0].words[1].placeholder).to.be.undefined
    expect(options[0].words[1].argument).to.equal('test')

    options = reconcileAndTraverse(grammar, 'a t')
    expect(options).to.have.length(0)
  })

  it('exports an argument', () => {
    const grammar = (
      <sequence>
        <literal text='a' />
        <label text='arg'>
          <sequence>
            <literal text='b' />
            <literal text='c' />
          </sequence>
        </label>
        <literal text='d' />
      </sequence>
    )

    const options = reconcileAndTraverse(grammar, 'abcd')
    expect(options).to.have.length(1)
    expect(options[0].words).to.have.length(4)
    expect(options[0].words[0].argument).to.not.be.true
    expect(options[0].words[1].argument).to.equal('arg')
    expect(options[0].words[2].argument).to.equal('arg')
    expect(options[0].words[3].argument).to.not.be.true
  })
})
