/** @jsx createElement */
/* eslint-env mocha */
import { expect } from 'chai'
import { text } from './_util'
import { Parser } from '..'
import { createElement, Phrase } from 'lacona-phrase'

describe('label', () => {
  var parser

  beforeEach(() => {
    parser = new Parser()
  })

  it('suppresses with a literal', () => {
    parser.grammar = (
      <sequence>
        <literal text='a ' id='a' value='a' />
        <label text='test' id='place' suppressEmpty={false}>
          <literal text='literal' value='test' />
        </label>
      </sequence>
    )

    const data1 = parser.parseArray('')
    expect(data1).to.have.length(1)
    expect(text(data1[0])).to.equal('a test')
    expect(data1[0].words[1].placeholder).to.be.true
    expect(data1[0].words[1].argument).to.equal('test')
    expect(data1[0].result).to.eql({a: 'a'})

    const data2 = parser.parseArray('a')
    expect(data2).to.have.length(1)
    expect(text(data2[0])).to.equal('a test')
    expect(data2[0].words[2].placeholder).to.be.true
    expect(data2[0].words[2].argument).to.equal('test')
    expect(data2[0].result).to.eql({a: 'a'})

    const data3 = parser.parseArray('a ')
    expect(data3).to.have.length(1)
    expect(text(data3[0])).to.equal('a literal')
    expect(data3[0].result).to.eql({a: 'a', place: 'test'})
    expect(data3[0].words[1].placeholder).to.be.undefined
    expect(data3[0].words[1].argument).to.equal('test')

    const data4 = parser.parseArray('a l')
    expect(data4).to.have.length(1)
    expect(text(data4[0])).to.equal('a literal')
    expect(data4[0].result).to.eql({a: 'a', place: 'test'})
    expect(data4[0].words[1].placeholder).to.be.undefined
    expect(data4[0].words[1].argument).to.equal('test')

    const data5 = parser.parseArray('a t')
    expect(data5).to.have.length(0)
  })

  // it('suppresses with an ellipsis', () => {
  //   parser.grammar = (
  //     <sequence>
  //       <literal text='a ' id='a' value='a' />
  //       <label ellipsis id='place' suppressEmpty={false}>
  //         <literal text='literal' value='test' />
  //       </label>
  //     </sequence>
  //   )

  //   const data1 = parser.parseArray('')
  //   expect(data1).to.have.length(1)
  //   expect(text(data1[0])).to.equal('a ')
  //   expect(data1[0].ellipsis).to.be.true

  //   const data2 = parser.parseArray('a')
  //   expect(data2).to.have.length(1)
  //   expect(text(data2[0])).to.equal('a ')
  //   expect(data2[0].ellipsis).to.be.true

  //   const data3 = parser.parseArray('a ')
  //   expect(data3).to.have.length(1)
  //   expect(text(data3[0])).to.equal('a literal')
  //   expect(data3[0].ellipsis).to.not.be.ok
  //   expect(data3[0].result).to.eql({a: 'a', place: 'test'})
  //   expect(data3[0].words[1].placeholder).to.be.undefined

  //   const data4 = parser.parseArray('a l')
  //   expect(data4).to.have.length(1)
  //   expect(text(data4[0])).to.equal('a literal')
  //   expect(data4[0].ellipsis).to.not.be.ok
  //   expect(data4[0].result).to.eql({a: 'a', place: 'test'})
  //   expect(data4[0].words[1].placeholder).to.be.undefined

  //   const data5 = parser.parseArray('a t')
  //   expect(data5).to.have.length(0)
  // })

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

    parser.grammar = (
      <sequence>
        <literal text='a ' id='a' value='a' />
        <label text='test' id='place'>
          <raw function={func} />
        </label>
      </sequence>
    )

    const data1 = parser.parseArray('')
    expect(data1).to.have.length(1)
    expect(text(data1[0])).to.equal('a test')
    expect(data1[0].result).to.eql({a: 'a'})
    expect(data1[0].words[1].placeholder).to.be.true
    expect(data1[0].words[1].argument).to.equal('test')

    const data2 = parser.parseArray('a')
    expect(data2).to.have.length(1)
    expect(text(data2[0])).to.equal('a test')
    expect(data2[0].result).to.eql({a: 'a'})
    expect(data2[0].words[2].placeholder).to.be.true
    expect(data2[0].words[2].argument).to.equal('test')

    const data3 = parser.parseArray('a ')
    expect(data3).to.have.length(1)
    expect(text(data3[0])).to.equal('a test')
    expect(data3[0].result).to.eql({a: 'a'})
    expect(data3[0].words[1].placeholder).to.be.true
    expect(data3[0].words[1].argument).to.equal('test')

    const data4 = parser.parseArray('a v')
    expect(data4).to.have.length(1)
    expect(text(data4[0])).to.equal('a value')
    expect(data4[0].result).to.eql({a: 'a', place: 'test'})
    expect(data4[0].words[1].placeholder).to.be.undefined
    expect(data4[0].words[1].argument).to.equal('test')

    const data5 = parser.parseArray('a t')
    expect(data5).to.have.length(0)
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

    parser.grammar = (
      <sequence>
        <literal text='a ' id='a' value='a' />
        <label text='test' id='place' suppressEmpty={false}>
          <raw function={func} />
        </label>
      </sequence>
    )

    const data1 = parser.parseArray('')
    expect(data1).to.have.length(1)
    expect(text(data1[0])).to.equal('a test')
    expect(data1[0].result).to.eql({a: 'a'})
    expect(data1[0].words[1].placeholder).to.be.true
    expect(data1[0].words[1].argument).to.equal('test')

    const data2 = parser.parseArray('a')
    expect(data2).to.have.length(1)
    expect(text(data2[0])).to.equal('a test')
    expect(data2[0].result).to.eql({a: 'a'})
    expect(data2[0].words[2].placeholder).to.be.true
    expect(data2[0].words[2].argument).to.equal('test')

    const data3 = parser.parseArray('a ')
    expect(data3).to.have.length(1)
    expect(text(data3[0])).to.equal('a value')
    expect(data3[0].result).to.eql({a: 'a', place: 'test'})
    expect(data3[0].words[1].placeholder).to.be.undefined
    expect(data3[0].words[1].argument).to.equal('test')

    const data5 = parser.parseArray('a t')
    expect(data5).to.have.length(0)
  })

  it('handles suppressWhen', () => {
    parser.grammar = (
      <sequence>
        <literal text='a ' id='a' value='a' />
        <label text='test' id='place' suppressWhen={input => input === 'l'} suppressEmpty={false}>
          <literal text='literal' value='test' />
        </label>
      </sequence>
    )

    const data1 = parser.parseArray('')
    expect(data1).to.have.length(1)
    expect(text(data1[0])).to.equal('a test')
    expect(data1[0].words[1].placeholder).to.be.true
    expect(data1[0].words[1].argument).to.equal('test')
    expect(data1[0].result).to.eql({a: 'a'})

    const data2 = parser.parseArray('a')
    expect(data2).to.have.length(1)
    expect(text(data2[0])).to.equal('a test')
    expect(data2[0].words[2].placeholder).to.be.true
    expect(data2[0].words[2].argument).to.equal('test')
    expect(data2[0].result).to.eql({a: 'a'})

    const data3 = parser.parseArray('a ')
    expect(data3).to.have.length(1)
    expect(text(data3[0])).to.equal('a literal')
    expect(data3[0].result).to.eql({a: 'a', place: 'test'})
    expect(data3[0].words[1].placeholder).to.be.undefined
    expect(data3[0].words[1].argument).to.equal('test')

    const data4 = parser.parseArray('a l')
    expect(data4).to.have.length(1)
    expect(text(data4[0])).to.equal('a test')
    expect(data4[0].result).to.eql({a: 'a'})
    expect(data4[0].words[1].placeholder).to.be.true
    expect(data4[0].words[1].argument).to.equal('test')

    const data5 = parser.parseArray('a li')
    expect(text(data5[0])).to.equal('a literal')
    expect(data5[0].result).to.eql({a: 'a', place: 'test'})
    expect(data5[0].words[1].placeholder).to.be.undefined
    expect(data5[0].words[1].argument).to.equal('test')

    const data6 = parser.parseArray('a t')
    expect(data6).to.have.length(0)
  })

  it('exports an argument', () => {
    parser.grammar = (
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

    const data = parser.parseArray('abcd')
    expect(data).to.have.length(1)
    expect(data[0].words).to.have.length(4)
    expect(data[0].words[0].argument).to.not.be.true
    expect(data[0].words[1].argument).to.equal('arg')
    expect(data[0].words[2].argument).to.equal('arg')
    expect(data[0].words[3].argument).to.not.be.true
  })

  // it('suppressIncomplete suppresses an incomplete child', () => {
  //   parser.grammar = (
  //     <label text='arg' suppressIncomplete>
  //       <sequence>
  //         <literal text='a' />
  //         <label text='test'>
  //           <literal text='b' />
  //         </label>
  //       </sequence>
  //     </label>
  //   )

  //   const data1 = parser.parseArray('')
  //   expect(data1).to.have.length(1)
  //   expect(text(data1[0])).to.equal('arg')
  //   expect(data1[0].words[0].placeholder).to.be.true

  //   const data2 = parser.parseArray('a')
  //   expect(data2).to.have.length(1)
  //   expect(text(data2[0])).to.equal('arg')
  //   expect(data2[0].words[0].placeholder).to.be.true

  //   const data3 = parser.parseArray('ab')
  //   expect(data3).to.have.length(1)
  //   expect(text(data3[0])).to.equal('ab')
  //   expect(data3[0].words).to.have.length(2)
  // })

  // it('suppressIncomplete allows a complete child', () => {
  //   parser.grammar = (
  //     <label text='arg' suppressIncomplete>
  //       <sequence>
  //         <literal text='a' />
  //         <choice>
  //           <literal text='b' />
  //           <label text='test'>
  //             <literal text='c' />
  //           </label>
  //         </choice>
  //       </sequence>
  //     </label>
  //   )

  //   const data1 = parser.parseArray('')
  //   expect(data1).to.have.length(1)
  //   expect(text(data1[0])).to.equal('arg')
  //   expect(data1[0].words[0].placeholder).to.be.true

  //   const data2 = parser.parseArray('a')
  //   expect(data2).to.have.length(2)
  //   expect(text(data2[0])).to.equal('ab')
  //   expect(text(data2[1])).to.equal('arg')
  //   expect(data2[1].words[0].placeholder).to.be.true

  //   const data3 = parser.parseArray('ab')
  //   expect(data3).to.have.length(1)
  //   expect(text(data3[0])).to.equal('ab')

  //   const data4 = parser.parseArray('ac')
  //   expect(data4).to.have.length(1)
  //   expect(text(data4[0])).to.equal('ac')
  // })
})
