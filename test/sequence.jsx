/** @jsx phrase.createElement */
/* eslint-env mocha */
import {expect} from 'chai'
import fulltext from 'lacona-util-fulltext'
import * as lacona from '..'
import * as phrase from 'lacona-phrase'

function from(i) {const a = []; for (let x of i) a.push(x); return a}

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

    const data = from(parser.parse('superm'))
    expect(data).to.have.length(1)
    expect(fulltext.suggestion(data[0])).to.equal('man')
    expect(data[0].result).to.be.empty
  })

  it('handles a separator', () => {
    parser.grammar = (
      <sequence>
        <content>
          <literal text='super' />
          <literal text='man' />
        </content>
        <separator>
          <literal text=' ' />
        </separator>
      </sequence>
    )

    const data = from(parser.parse('super m'))
    expect(data).to.have.length(1)
    expect(fulltext.suggestion(data[0])).to.equal('man')
    expect(data[0].result).to.be.empty
  })

  it('handles an optional child with a separator', () => {
    parser.grammar = (
      <sequence>
        <literal text='super' />
        <literal text='maximum' optional={true} />
        <literal text='man' />
      </sequence>
    )

    const data = from(parser.parse('superm'))
    expect(data).to.have.length(2)
    expect(fulltext.suggestion(data[0])).to.equal('man')
    expect(fulltext.suggestion(data[1])).to.equal('maximum')
  })

  it('handles an optional child without a separator', () => {
    parser.grammar = (
      <sequence>
        <literal text='super' />
        <literal text='maximum' optional={true} />
        <literal text='man' />
      </sequence>
    )

    const data = from(parser.parse('superm'))
    expect(data).to.have.length(2)
    expect(fulltext.suggestion(data[0])).to.equal('man')
    expect(fulltext.suggestion(data[1])).to.equal('maximum')
  })

  it('handles an optional child that is preferred', () => {
    parser.grammar = (
      <sequence>
        <literal text='super' />
        <literal text='maximum' optional={true} preferred={true} />
        <literal text='man' />
      </sequence>
    )

    const data = from(parser.parse('superm'))
    expect(data).to.have.length(2)
    expect(fulltext.suggestion(data[0])).to.equal('maximum')
    expect(fulltext.suggestion(data[1])).to.equal('man')
  })

  it('handles an optional child that is limited', () => {
    parser.grammar = (
      <sequence>
        <literal text='super' />
        <literal text='maximum' optional={true} limited={true} />
        <literal text='man' />
      </sequence>
    )

    const data = from(parser.parse('superm'))
    expect(data).to.have.length(1)
    expect(fulltext.suggestion(data[0])).to.equal('man')
  })

  it('handles an optional child that is preferred and limited', () => {
    parser.grammar = (
      <sequence>
        <literal text='super' />
        <literal text='maximum' optional={true} preferred={true} limited={true} />
        <literal text='man' />
      </sequence>
    )

    const data = from(parser.parse('superm'))
    expect(data).to.have.length(1)
    expect(fulltext.suggestion(data[0])).to.equal('maximum')
  })

  it('handles an optional child that is a sequence', () => {
    parser.grammar = (
      <sequence>
        <literal text='super' />
        <sequence optional={true}>
          <literal text='man' />
          <literal text='again' />
        </sequence>
      </sequence>
    )

    const data = from(parser.parse('supermanaga'))
    expect(data).to.have.length(1)
    expect(fulltext.all(data[0])).to.equal('supermanagain')
  })

  it('handles an optional child with a separator', () => {
    parser.grammar = (
      <sequence>
        <content>
          <literal text='super' />
          <literal text='maximum' optional={true} />
          <literal text='man' />
        </content>
        <separator>
          <literal text=' ' />
        </separator>
      </sequence>
    )

    const data = from(parser.parse('super m'))
    expect(data).to.have.length(2)
    expect(fulltext.suggestion(data[0])).to.equal('man')
    expect(fulltext.suggestion(data[1])).to.equal('maximum')
  })

  it('does not take an optional childs value', () => {
    parser.grammar = (
      <sequence>
        <literal text='super' />
        <literal text='maximum' value='someValue' id='opt' optional={true} />
        <literal text='man' />
      </sequence>
    )

    const data = from(parser.parse('superm'))
    expect(data).to.have.length(2)
    expect(fulltext.suggestion(data[0])).to.equal('man')
    expect(fulltext.suggestion(data[1])).to.equal('maximum')
    expect(data[0].result.opt).to.be.undefined
    expect(data[1].result.opt).to.equal('someValue')
  })

  it('can set a value to the result', () => {
    parser.grammar = (
      <sequence value='testValue'>
        <literal text='super' />
        <literal text='man' />
      </sequence>
    )

    const data = from(parser.parse('superm'))
    expect(data).to.have.length(1)
    expect(data[0].result).to.equal('testValue')
  })

  it('results is an object with id keys', () => {
    parser.grammar = (
      <sequence>
        <literal id='desc' text='super' value='super' />
        <literal id='noun' text='man' value='man' />
      </sequence>
    )

    const data = from(parser.parse('superm'))
    expect(data).to.have.length(1)
    expect(data[0].result).to.eql({
      desc: 'super',
      noun: 'man'
    })
  })

  it('results is an object with id keys, even with separator', () => {
    parser.grammar = (
      <sequence>
        <content>
          <literal id='desc' text='super' value='super' />
          <literal id='noun' text='man' value='man' />
        </content>
        <separator><literal text=' ' /></separator>
      </sequence>
    )

    const data = from(parser.parse('super m'))
    expect(data).to.have.length(1)
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

    const data = from(parser.parse('superm'))
    expect(data).to.have.length(1)
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
        <literal text='man' value='man' merge={true} />
      </sequence>
    )

    const data = from(parser.parse('superm'))
    expect(data).to.have.length(1)
    expect(data[0].result).to.eql('man')
  })


  it('will merge results in for optionals', () => {
    parser.grammar = (
      <sequence>
        <literal text='super' />
        <literal text='man' value='man' optional={true} merge={true} />
      </sequence>
    )

    const data = from(parser.parse('sup'))
    expect(data).to.have.length(2)
    expect(fulltext.all(data[0])).to.eql('super')
    expect(data[0].result).to.eql({})

    expect(fulltext.all(data[1])).to.eql('superman')
    expect(data[1].result).to.eql('man')
  })

  it('will merge results in, even with separator', () => {
    parser.grammar = (
      <sequence>
        <content>
          <literal id='desc' text='super' value='super' />
          <sequence merge='true'>
            <content>
              <literal id='noun' text='man' value='man' />
              <literal id='adj' text='rocks' value='rocks' />
            </content>
            <separator><literal text=' ' /></separator>
          </sequence>
        </content>
        <separator><literal text=' ' /></separator>
      </sequence>
    )

    const data = from(parser.parse('super m'))
    expect(data).to.have.length(1)
    expect(data[0].result).to.eql({
      desc: 'super',
      noun: 'man',
      adj: 'rocks'
    })
  })

  it('passes on its category', () => {
    parser.grammar = (
      <sequence category='myCat'>
        <literal text='super' />
        <literal text='man' />
      </sequence>
    )

    const data = from(parser.parse('superm'))
    expect(data).to.have.length(1)
    expect(data[0].match[0].category).to.equal('myCat')
    expect(data[0].suggestion[0].category).to.equal('myCat')
  })

  it('ignores strings and nulls for reconciliation', () => {
    class Test extends phrase.Phrase {
      describe() {
        return (
          <sequence>
            {null}
            <literal text='test' />
            someString
          </sequence>
        )
      }
    }

    parser.grammar = <Test />
    const data = parser.parseArray('test')
    expect(data).to.have.length(1)
    expect(fulltext.all(data[0])).to.equal('test')
  })
})
