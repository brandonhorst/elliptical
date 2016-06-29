/** @jsx createElement */
/* eslint-env mocha */

import createElement from '../src/element'
import {compileAndTraverse, text} from './_util'

import {expect} from 'chai'

describe('placeholder', () => {
  it('suppresses with a literal', () => {
    const grammar = (
      <sequence>
        <literal text='a ' id='a' value='a' />
        <placeholder text='test' id='place' suppressEmpty={false}>
          <literal text='literal' value='test' />
        </placeholder>
      </sequence>
    )
    let options

    options = compileAndTraverse(grammar, '')
    expect(options).to.have.length(1)
    expect(text(options[0])).to.equal('a test')
    expect(options[0].words[1].placeholder).to.be.true
    expect(options[0].words[1].text).to.equal('test')
    expect(options[0].result).to.eql({a: 'a'})

    options = compileAndTraverse(grammar, 'a')
    expect(options).to.have.length(1)
    expect(text(options[0])).to.equal('a test')
    expect(options[0].words[2].placeholder).to.be.true
    expect(options[0].words[2].text).to.equal('test')
    expect(options[0].result).to.eql({a: 'a'})

    options = compileAndTraverse(grammar, 'a ')
    expect(options).to.have.length(1)
    expect(text(options[0])).to.equal('a literal')
    expect(options[0].result).to.eql({a: 'a', place: 'test'})
    expect(options[0].words[1].placeholder).to.be.undefined
    expect(options[0].words[1].text).to.equal('literal')

    options = compileAndTraverse(grammar, 'a l')
    expect(options).to.have.length(1)
    expect(text(options[0])).to.equal('a literal')
    expect(options[0].result).to.eql({a: 'a', place: 'test'})
    expect(options[0].words[1].placeholder).to.be.undefined
    expect(options[0].words[1].text).to.equal('l')

    options = compileAndTraverse(grammar, 'a t')
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
        <placeholder text='test' id='place'>
          <raw func={func} />
        </placeholder>
      </sequence>
    )
    let options

    options = compileAndTraverse(grammar, '')
    expect(options).to.have.length(1)
    expect(text(options[0])).to.equal('a test')
    expect(options[0].result).to.eql({a: 'a'})
    expect(options[0].words[1].placeholder).to.be.true
    expect(options[0].words[1].text).to.equal('test')

    options = compileAndTraverse(grammar, 'a')
    expect(options).to.have.length(1)
    expect(text(options[0])).to.equal('a test')
    expect(options[0].result).to.eql({a: 'a'})
    expect(options[0].words[2].placeholder).to.be.true
    expect(options[0].words[2].text).to.equal('test')

    options = compileAndTraverse(grammar, 'a ')
    expect(options).to.have.length(1)
    expect(text(options[0])).to.equal('a test')
    expect(options[0].result).to.eql({a: 'a'})
    expect(options[0].words[1].placeholder).to.be.true
    expect(options[0].words[1].text).to.equal('test')

    options = compileAndTraverse(grammar, 'a v')
    expect(options).to.have.length(1)
    expect(text(options[0])).to.equal('a value')
    expect(options[0].result).to.eql({a: 'a', place: 'test'})
    expect(options[0].words[1].placeholder).to.be.undefined
    expect(options[0].words[1].text).to.equal('value')

    options = compileAndTraverse(grammar, 'a t')
    expect(options).to.have.length(0)
  })

  it('handles suppressWhen', () => {
    const grammar = (
      <sequence>
        <literal text='a ' id='a' value='a' />
        <placeholder text='test' id='place'
          suppressWhen={(input) => input === 'l'}
          suppressEmpty={false}>
          <literal text='literal' value='test' />
        </placeholder>
      </sequence>
    )
    let options

    options = compileAndTraverse(grammar, '')
    expect(options).to.have.length(1)
    expect(text(options[0])).to.equal('a test')
    expect(options[0].words[1].placeholder).to.be.true
    expect(options[0].words[1].text).to.equal('test')
    expect(options[0].result).to.eql({a: 'a'})

    options = compileAndTraverse(grammar, 'a')
    expect(options).to.have.length(1)
    expect(text(options[0])).to.equal('a test')
    expect(options[0].words[2].placeholder).to.be.true
    expect(options[0].words[2].text).to.equal('test')
    expect(options[0].result).to.eql({a: 'a'})

    options = compileAndTraverse(grammar, 'a ')
    expect(options).to.have.length(1)
    expect(text(options[0])).to.equal('a literal')
    expect(options[0].result).to.eql({a: 'a', place: 'test'})
    expect(options[0].words[1].placeholder).to.be.undefined
    expect(options[0].words[1].text).to.equal('literal')

    options = compileAndTraverse(grammar, 'a l')
    expect(options).to.have.length(1)
    expect(text(options[0])).to.equal('a test')
    expect(options[0].result).to.eql({a: 'a'})
    expect(options[0].words[1].placeholder).to.be.true
    expect(options[0].words[1].text).to.equal('test')

    options = compileAndTraverse(grammar, 'a li')
    expect(text(options[0])).to.equal('a literal')
    expect(options[0].result).to.eql({a: 'a', place: 'test'})
    expect(options[0].words[1].placeholder).to.be.undefined
    expect(options[0].words[1].text).to.equal('li')

    options = compileAndTraverse(grammar, 'a t')
    expect(options).to.have.length(0)
  })

  it('uses argument if no text is provided', () => {
    const grammar = (
      <sequence>
        <literal text='a ' />
        <placeholder argument='test'>
          <literal text='literal' />
        </placeholder>
      </sequence>
    )

    const options = compileAndTraverse(grammar, 'a')
    expect(options).to.have.length(1)
    expect(text(options[0])).to.equal('a test')
    expect(options[0].words[2].placeholder).to.be.true
    expect(options[0].words[2].text).to.equal('test')
  })
})
