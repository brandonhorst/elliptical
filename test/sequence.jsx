/** @jsx phrase.createElement */
/* eslint-env mocha */
import {expect} from 'chai'
import {text} from './_util'
import * as lacona from '..'
import * as phrase from 'lacona-phrase'

describe('sequence', function () {
  var parser

  beforeEach(function () {
    parser = new lacona.Parser()
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

  it('handles an optional child with a separator', () => {
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
    class Test extends phrase.Phrase {
      describe() {
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

  it('allows for uniqueness', () => {
    class Test extends phrase.Phrase {
      describe() {
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
})
