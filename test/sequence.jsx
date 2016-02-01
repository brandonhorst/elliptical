/** @jsx createElement */
/* eslint-env mocha */
import { expect } from 'chai'
import { text } from './_util'
import { Parser } from '..'
import { createElement, Phrase } from 'lacona-phrase'

describe('sequence', () => {
  var parser

  beforeEach(() => {
    parser = new Parser()
  })

  it('puts two elements in order', () => {
    parser.grammar = (
      <sequence>
        <literal text='super' />
        <literal text='man' />
      </sequence>
    )

    const data = parser.parseArray('')
    expect(data).to.have.length(1)
    expect(text(data[0])).to.equal('superman')
    expect(data[0].result).to.be.empty
  })

  it('handles an optional child', () => {
    parser.grammar = (
      <sequence>
        <literal text='super' />
        <literal text='maximum' optional />
        <literal text='man' />
      </sequence>
    )

    const data = parser.parseArray('')
    expect(data).to.have.length(2)
    expect(text(data[0])).to.equal('superman')
    expect(text(data[1])).to.equal('supermaximumman')
  })

  it('handles an ellipsis', () => {
    parser.grammar = (
      <sequence>
        <literal text='super' ellipsis />
        <literal text='man' />
      </sequence>
    )

    const data1 = parser.parseArray('')
    expect(data1).to.have.length(1)
    expect(text(data1[0])).to.equal('super')

    const data2 = parser.parseArray('super')
    expect(data2).to.have.length(1)
    expect(text(data2[0])).to.equal('super')

    const data3 = parser.parseArray('superm')
    expect(data3).to.have.length(1)
    expect(text(data3[0])).to.equal('superman')
  })

  it('does not output an ellipsis twice for the same text', () => {
    parser.grammar = (
      <sequence>
        <literal text='super' />
        <literal text='man' ellipsis />
        <literal text='rocks' ellipsis />
      </sequence>
    )

    const data1 = parser.parseArray('')
    expect(data1).to.have.length(1)
    expect(text(data1[0])).to.equal('superman')

    const data2 = parser.parseArray('super')
    expect(data2).to.have.length(1)
    expect(text(data2[0])).to.equal('superman')

    const data3 = parser.parseArray('superman')
    expect(data3).to.have.length(1)
    expect(text(data3[0])).to.equal('superman')

    const data4 = parser.parseArray('supermanr')
    expect(data4).to.have.length(1)
    expect(text(data4[0])).to.equal('supermanrocks')
  })

  it('handles an ellipsis that is optional', () => {
    parser.grammar = (
      <sequence>
        <literal text='super' ellipsis optional  />
        <literal text='man' />
      </sequence>
    )

    const data1 = parser.parseArray('')
    expect(data1).to.have.length(2)
    expect(text(data1[0])).to.equal('')
    expect(text(data1[1])).to.equal('super')

    const data2 = parser.parseArray('s')
    expect(data2).to.have.length(1)
    expect(text(data2[0])).to.equal('super')

    const data3 = parser.parseArray('super')
    expect(data3).to.have.length(1)
    expect(text(data3[0])).to.equal('super')

    const data4 = parser.parseArray('superm')
    expect(data4).to.have.length(1)
    expect(text(data4[0])).to.equal('superman')
  })

  it('handles an optional child that is preferred', () => {
    parser.grammar = (
      <sequence>
        <literal text='super' />
        <literal text='maximum' optional preferred />
        <literal text='man' />
      </sequence>
    )

    const data = parser.parseArray('')
    expect(data).to.have.length(2)
    expect(text(data[0])).to.equal('supermaximumman')
    expect(text(data[1])).to.equal('superman')
  })

  it('handles an optional child that is limited', () => {
    parser.grammar = (
      <sequence>
        <literal text='super' />
        <literal text='maximum' optional limited />
        <literal text='man' />
      </sequence>
    )

    const data = parser.parseArray('')
    expect(data).to.have.length(1)
    expect(text(data[0])).to.equal('superman')
  })

  it('handles an optional child that is preferred and limited', () => {
    parser.grammar = (
      <sequence>
        <literal text='super' />
        <literal text='maximum' optional preferred limited />
        <literal text='man' />
      </sequence>
    )

    const data = parser.parseArray('')
    expect(data).to.have.length(1)
    expect(text(data[0])).to.equal('supermaximumman')
  })

  it('handles an optional child that is a sequence', () => {
    parser.grammar = (
      <sequence>
        <literal text='super' />
        <sequence optional>
          <literal text='man' />
          <literal text='again' />
        </sequence>
      </sequence>
    )

    const data = parser.parseArray('superm')
    expect(data).to.have.length(1)
    expect(text(data[0])).to.equal('supermanagain')
  })

  it('handles an optional child that is a sequence with freetexts', () => {
    parser.grammar = (
      <sequence>
        <freetext limit={1} />
        <sequence optional>
          <literal text='man' />
          <freetext limit={1} />
          <literal text='returns' />
        </sequence>
      </sequence>
    )

    const data = parser.parseArray('supermanagainret')
    expect(data).to.have.length(1)
    expect(text(data[0])).to.equal('supermanagainreturns')
  })

  it('does not take an optional childs value', () => {
    parser.grammar = (
      <sequence>
        <literal text='super' />
        <literal text='maximum' value='someValue' id='opt' optional />
        <literal text='man' />
      </sequence>
    )

    const data = parser.parseArray('')
    expect(data).to.have.length(2)
    expect(text(data[0])).to.equal('superman')
    expect(data[0].result.opt).to.be.undefined
    expect(text(data[1])).to.equal('supermaximumman')
    expect(data[1].result.opt).to.equal('someValue')
  })

  it('can set a value to the result', () => {
    parser.grammar = (
      <sequence value='testValue'>
        <literal text='super' />
        <literal text='man' />
      </sequence>
    )

    const data = parser.parseArray('')
    expect(data).to.have.length(1)
    expect(text(data[0])).to.equal('superman')
    expect(data[0].result).to.equal('testValue')
  })

  it('results is an object with id keys', () => {
    parser.grammar = (
      <sequence>
        <literal id='desc' text='super' value='super' />
        <literal id='noun' text='man' value='man' />
      </sequence>
    )

    const data = parser.parseArray('')
    expect(data).to.have.length(1)
    expect(text(data[0])).to.equal('superman')
    expect(data[0].result).to.eql({
      desc: 'super',
      noun: 'man'
    })
  })

  it('will merge results in', () => {
    parser.grammar = (
      <sequence>
        <literal id='desc' text='super' value='super' />
        <sequence merge='true'>
          <literal id='noun' text='man' value='man' />
          <literal id='adj' text='rocks' value='rocks' />
        </sequence>
      </sequence>
    )

    const data = parser.parseArray('')
    expect(data).to.have.length(1)
    expect(text(data[0])).to.equal('supermanrocks')
    expect(data[0].result).to.eql({
      desc: 'super',
      noun: 'man',
      adj: 'rocks'
    })
  })

  it('will merge non-object results in', () => {
    parser.grammar = (
      <sequence>
        <literal text='super' />
        <literal text='man' value='man' merge />
      </sequence>
    )

    const data = parser.parseArray('')
    expect(data).to.have.length(1)
    expect(text(data[0])).to.equal('superman')
    expect(data[0].result).to.eql('man')
  })

  it('will merge results in for optionals', () => {
    parser.grammar = (
      <sequence>
        <literal text='super' />
        <literal text='man' value='man' optional merge />
      </sequence>
    )

    const data = parser.parseArray('')
    expect(data).to.have.length(2)
    expect(text(data[0])).to.eql('super')
    expect(data[0].result).to.eql({})

    expect(text(data[1])).to.eql('superman')
    expect(data[1].result).to.eql('man')
  })

  it('ignores strings and nulls for reconciliation', () => {
    class Test extends Phrase {
      describe () {
        return (
          <sequence>
            {null}
            <literal text='test' />
            some string
          </sequence>
        )
      }
    }

    parser.grammar = <Test />
    const data = parser.parseArray('test')
    expect(data).to.have.length(1)
    expect(text(data[0])).to.equal('test')
  })

  it('checks for uniqueness', () => {
    class Test extends Phrase {
      describe () {
        return (
          <sequence unique>
            <literal text='test' optional id='test' value={1} />
            <literal text='a' />
            <literal text='test' optional id='test' value={2} />
          </sequence>
        )
      }
    }

    parser.grammar = <Test />
    const data1 = parser.parseArray('testa')
    expect(data1).to.have.length(1)
    expect(text(data1[0])).to.equal('testa')
    expect(data1[0].result.test).to.equal(1)

    const data2 = parser.parseArray('atest')
    expect(data2).to.have.length(1)
    expect(text(data2[0])).to.equal('atest')
    expect(data2[0].result.test).to.equal(2)

    const data3 = parser.parseArray('testatest')
    expect(data3).to.have.length(0)
  })

  it('allows for uniqueness in merges', () => {
    class Test extends Phrase {
      describe () {
        return (
          <sequence unique>
            <literal text='test' optional id='test' value={1} />
            <literal text='a' />
            <literal text='test' optional merge value={{test: 2}} />
          </sequence>
        )
      }
    }

    parser.grammar = <Test />
    const data1 = parser.parseArray('testa')
    expect(data1).to.have.length(1)
    expect(text(data1[0])).to.equal('testa')
    expect(data1[0].result.test).to.equal(1)

    const data2 = parser.parseArray('atest')
    expect(data2).to.have.length(1)
    expect(text(data2[0])).to.equal('atest')
    expect(data2[0].result.test).to.equal(2)

    const data3 = parser.parseArray('testatest')
    expect(data3).to.have.length(0)
  })
})
