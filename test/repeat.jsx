/** @jsx createElement */
/* eslint-env mocha */
import { expect } from 'chai'
import { Parser } from '..'
import { createElement } from 'lacona-phrase'
import { text } from './_util'

describe('repeat', () => {
  let parser

  beforeEach(() => {
    parser = new Parser()
  })

  describe('separator', () => {
    it('does not accept input that does not match the child', () => {
      parser.grammar = (
        <repeat separator={<literal text='man' />}>
          <literal text='super' />
        </repeat>
      )

      const data = parser.parseArray('wrong')
      expect(data).to.have.length(0)
    })

    it('accepts the child on its own', () => {
      parser.grammar = (
        <repeat separator={<literal text='man' />}>
          <literal text='super' />
        </repeat>
      )

      const data = parser.parseArray('superm')
      expect(data).to.have.length(1)
      expect(text(data[0])).to.equal('supermansuper')
      expect(data[0].ellipsis).to.be.true
    })

    it('accepts the child twice, with the separator in the middle', () => {
      parser.grammar = (
        <repeat separator={<literal text='man' />}>
          <literal text='super' />
        </repeat>
      )

      const data = parser.parseArray('supermans')
      expect(data).to.have.length(1)
      expect(text(data[0])).to.equal('supermansuper')
      expect(data[0].ellipsis).to.be.true
    })

    it('accepts the child twice and suggests when complete, with the separator in the middle', () => {
      parser.grammar = (
        <repeat separator={<literal text='man' />}>
          <literal text='super' />
        </repeat>
      )

      const data = parser.parseArray('supermansuper')
      expect(data).to.have.length(2)
      expect(text(data[0])).to.equal('supermansuper')
      expect(data[0].ellipsis).to.be.true
      expect(text(data[1])).to.equal('supermansupermansuper')
      expect(data[1].ellipsis).to.be.true
    })

    it('allows for content to have children', () => {
      parser.grammar = (
        <repeat separator={<literal text=' ' />}>
          <choice>
            <literal text='a' />
            <literal text='b' />
          </choice>
        </repeat>
      )

      const data = parser.parseArray('a ')
      expect(data).to.have.length(2)
      expect(text(data[0])).to.equal('a a')
      expect(text(data[1])).to.equal('a b')
      expect(data[0].ellipsis).to.be.true
      expect(data[1].ellipsis).to.be.true
    })
  })

  it('allows for content to have children', () => {
    parser.grammar = (
      <repeat>
        <choice>
          <literal text='a' />
          <literal text='b' />
        </choice>
      </repeat>
    )

    const data = parser.parseArray('')
    expect(data).to.have.length(2)
    expect(text(data[0])).to.equal('a')
    expect(text(data[1])).to.equal('b')
    expect(data[0].ellipsis).to.be.true
  })

  it('does not accept input that does not match the child', () => {
    parser.grammar = (
      <repeat>
        <literal text='super' />
      </repeat>
    )
    const data = parser.parseArray('wrong')
    expect(data).to.have.length(0)
  })

  it('accepts the child on its own', () => {
    parser.grammar = (
      <repeat>
        <literal text='super' />
      </repeat>
    )

    const data = parser.parseArray('sup')
    expect(data).to.have.length(1)
    expect(text(data[0])).to.equal('super')
    expect(data[0].ellipsis).to.be.true
  })

  it('accepts the child twice', () => {
    parser.grammar = (
      <repeat>
        <literal text='super' />
      </repeat>
    )

    const data = parser.parseArray('supers')
    expect(data).to.have.length(1)
    expect(text(data[0])).to.equal('supersuper')
    expect(data[0].ellipsis).to.be.true
  })

  it('accepts the child twice', () => {
    parser.grammar = (
      <repeat>
        <literal text='super' />
      </repeat>
    )

    const data = parser.parseArray('supersuper')
    expect(data).to.have.length(2)
    expect(text(data[0])).to.equal('supersuper')
    expect(data[0].ellipsis).to.be.true
    expect(text(data[1])).to.equal('supersupersuper')
    expect(data[1].ellipsis).to.be.true
  })

  it('creates an array from the values of the children', () => {
    parser.grammar = (
      <repeat>
        <choice>
          <literal text='super' value='super' />
          <literal text='man' value='man' />
        </choice>
      </repeat>
    )

    const data = parser.parseArray('superm')
    expect(data).to.have.length(1)
    expect(text(data[0])).to.equal('superman')
    expect(data[0].result).to.eql(['super', 'man'])
    expect(data[0].ellipsis).to.be.true
  })

  it('does not accept fewer than min iterations', () => {
    parser.grammar = (
      <repeat min={2}>
        <literal text='a' />
      </repeat>
    )

    const data = parser.parseArray('a')
    expect(data).to.have.length(1)
    expect(text(data[0])).to.equal('aa')
    expect(data[0].ellipsis).to.be.true
  })

  it('does not accept more than max iterations', () => {
    parser.grammar = (
      <repeat max={1} >
        <literal text='a' />
      </repeat>
    )

    const data = parser.parseArray('aa')
    expect(data).to.have.length(0)
  })

  it('does not output an ellipsis at max iterations', () => {
    parser.grammar = (
      <repeat max={2} >
        <literal text='a' />
      </repeat>
    )

    const data = parser.parseArray('aa')
    expect(data).to.have.length(1)
    expect(text(data[0])).to.equal('aa')
    expect(data[0].ellipsis).to.not.be.ok
  })

  it('rejects non-unique repeated elements', () => {
    parser.grammar = (
      <repeat unique>
        <choice>
          <literal text='a' value='a' />
          <literal text='b' value='b' />
        </choice>
      </repeat>
    )

    const data = parser.parseArray('aa')
    expect(data).to.have.length(0)
  })

  it('rejects non-unique repeated elements (deep)', () => {
    parser.grammar = (
      <repeat unique>
        <choice>
          <literal text='a' value={{a: 1}} />
          <literal text='b' value={{a: 1}} />
        </choice>
      </repeat>
    )

    const data = parser.parseArray('ab')
    expect(data).to.have.length(0)
  })

  it('accepts unique repeated elements', () => {
    parser.grammar = (
      <repeat unique>
        <choice>
          <literal text='a' value='a' />
          <literal text='b' value='b' />
        </choice>
      </repeat>
    )

    const data = parser.parseArray('ab')
    expect(data).to.have.length(1)
    expect(text(data[0])).to.equal('ab')
    expect(data[0].ellipsis).to.be.true
  })

  it('accepts non-unique repeated elements (deep)', () => {
    parser.grammar = (
      <repeat unique>
        <choice>
          <literal text='a' value={{a: 1}} />
          <literal text='b' value={{a: 2}} />
        </choice>
      </repeat>
    )

    const data = parser.parseArray('ab')
    expect(data).to.have.length(1)
    expect(text(data[0])).to.equal('ab')
    expect(data[0].ellipsis).to.be.true
  })

  it('allows for choices inside of repeats to be limited', () => {
    parser.grammar = (
      <repeat>
        <choice limit={1}>
          <literal text='aa' />
          <literal text='ab' />
          <literal text='ac' />
        </choice>
      </repeat>
    )

    const data = parser.parseArray('aba')
    expect(data).to.have.length(1)
    expect(text(data[0])).to.equal('abaa')
    expect(data[0].ellipsis).to.be.true
  })

  it('allows for choices inside of repeat separators to be limited', () => {
    parser.grammar = (
      <repeat separator={
        <choice limit={1}>
          <literal text='aa' />
          <literal text='ab' />
          <literal text='ac' />
        </choice>
      }>
        <literal text='x' />
      </repeat>
    )

    const data = parser.parseArray('xa')
    expect(data).to.have.length(1)
    expect(text(data[0])).to.equal('xaax')
    expect(data[0].ellipsis).to.be.true
  })
})
