/** @jsx createElement */
/* eslint-env mocha */
import {expect} from 'chai'
import {Parser} from '..'
import {createElement} from 'lacona-phrase'
import {text} from './_util'

describe('repeat', () => {
  let parser

  beforeEach(() => {
    parser = new Parser()
  })

  describe('separator', () => {
    it('does not accept input that does not match the child', () => {
      parser.grammar = (
        <repeat separator={<literal text='man' />}>
          <label text='test'>
            <literal text='super' />
          </label>
        </repeat>
      )

      const data = parser.parseArray('wrong')
      expect(data).to.have.length(0)
    })

    it('accepts the child on its own', () => {
      parser.grammar = (
        <repeat separator={<literal text='man' />}>
          <label text='test'>
            <literal text='super' />
          </label>
        </repeat>
      )

      const data = parser.parseArray('superm')
      expect(data).to.have.length(1)
      expect(text(data[0])).to.equal('supermantest')
    })

    it('accepts the child twice, with the separator in the middle', () => {
      parser.grammar = (
        <repeat separator={<literal text='man' />} max={2}>
          <label text='test'>
            <literal text='super' />
          </label>
        </repeat>
      )

      const data = parser.parseArray('supermans')
      expect(data).to.have.length(1)
      expect(text(data[0])).to.equal('supermansuper')
    })

    it('allows for content to have children', () => {
      parser.grammar = (
        <repeat separator={<literal text=' ' />} max={2}>
          <label text='test'>
            <choice>
              <literal text='a' />
              <literal text='b' />
            </choice>
          </label>
        </repeat>
      )

      const data = parser.parseArray('a')
      expect(data).to.have.length(2)
      expect(text(data[0])).to.equal('a')
      expect(text(data[1])).to.equal('a test')
    })
  })

  it('allows for content to have children', () => {
    parser.grammar = (
      <repeat>
        <label text='test' showForEmpty>
          <choice>
            <literal text='a' />
            <literal text='b' />
          </choice>
        </label>
      </repeat>
    )

    const data = parser.parseArray('')
    expect(data).to.have.length(1)
    expect(text(data[0])).to.equal('test')
    expect(data[0].words[0].placeholder).to.be.true
  })

  it('does not accept input that does not match the child', () => {
    parser.grammar = (
      <repeat>
        <label text='test'>
          <literal text='super' />
        </label>
      </repeat>
    )
    const data = parser.parseArray('wrong')
    expect(data).to.have.length(0)
  })

  it('accepts the child on its own', () => {
    parser.grammar = (
      <repeat>
        <label text='test'>
          <literal text='super' />
        </label>
      </repeat>
    )

    const data = parser.parseArray('sup')
    expect(data).to.have.length(2)
    expect(text(data[0])).to.equal('super')
    expect(text(data[1])).to.equal('supertest')
    expect(data[1].words[2].placeholder).to.be.true
  })

  it('accepts the child twice', () => {
    parser.grammar = (
      <repeat>
        <label text='test'>
          <literal text='super' />
        </label>
      </repeat>
    )

    const data = parser.parseArray('supers')
    expect(data).to.have.length(2)
    expect(text(data[0])).to.equal('supersuper')
    expect(text(data[1])).to.equal('supersupertest')
  })

  it('creates an array from the values of the children', () => {
    parser.grammar = (
      <repeat max={2}>
        <label text='test'>
          <choice>
            <literal text='super' value='super' />
            <literal text='man' value='man' />
          </choice>
        </label>
      </repeat>
    )

    const data = parser.parseArray('superm')
    expect(data).to.have.length(1)
    expect(text(data[0])).to.equal('superman')
    expect(data[0].result).to.eql(['super', 'man'])
  })

  it('does not accept fewer than min iterations', () => {
    parser.grammar = (
      <repeat min={2}>
        <label text='test' showForEmpty>
          <literal text='a' />
        </label>
      </repeat>
    )

    const data = parser.parseArray('a')
    expect(data).to.have.length(1)
    expect(text(data[0])).to.equal('atest')
  })

  it('does not accept more than max iterations', () => {
    parser.grammar = (
      <repeat max={1} >
        <label text='test'>
          <literal text='a' />
        </label>
      </repeat>
    )

    const data = parser.parseArray('a')
    expect(data).to.have.length(1)
    expect(text(data[0])).to.equal('a')
  })
  //
  // it('passes on its category', () => {
  //   parser.grammar = (
  //     <repeat category='myCat'>
  //       <literal text='a' />
  //     </repeat>
  //   ]
  //
  //   const data = parser.parseArray('')
  //   expect(data).to.have.length(2)
  //   expect(data[0].suggestion[0].category).to.equal('myCat')
  //   expect(data[1].suggestion[0].category).to.equal('myCat')
  //   expect(data[1].completion[0].category).to.equal('myCat')
  // })

  it('rejects non-unique repeated elements', () => {
    parser.grammar = (
      <repeat unique>
        <label text='test'>
          <choice>
            <literal text='a' value='a' />
            <literal text='b' value='b' />
          </choice>
        </label>
      </repeat>
    )

    const data = parser.parseArray('aa')
    expect(data).to.have.length(0)
  })

  it('rejects non-unique repeated elements (deep)', () => {
    parser.grammar = (
      <repeat unique>
        <label text='test'>
          <choice>
            <literal text='a' value={{a: 1}} />
            <literal text='b' value={{a: 1}} />
          </choice>
        </label>
      </repeat>
    )

    const data = parser.parseArray('ab')
    expect(data).to.have.length(0)
  })

  it('accepts unique repeated elements', () => {
    parser.grammar = (
      <repeat unique max={2}>
        <label text='test'>
          <choice>
            <literal text='a' value='a' />
            <literal text='b' value='b' />
          </choice>
        </label>
      </repeat>
    )

    const data = parser.parseArray('ab')
    expect(data).to.have.length(1)
    expect(text(data[0])).to.equal('ab')
  })

  it('accepts non-unique repeated elements (deep)', () => {
    parser.grammar = (
      <repeat unique>
        <label text='test'>
          <choice>
            <literal text='a' value={{a: 1}} />
            <literal text='b' value={{a: 2}} />
          </choice>
        </label>
      </repeat>
    )

    const data = parser.parseArray('ab')
    expect(data).to.have.length(1)
    expect(text(data[0])).to.equal('ab')
  })

  it('allows for choices inside of repeats to be limited', () => {
    parser.grammar = (
      <repeat>
        <label text='test'>
          <choice limit={1}>
            <literal text='aa' />
            <literal text='ab' />
            <literal text='ac' />
          </choice>
        </label>
      </repeat>
    )

    const data = parser.parseArray('aba')
    expect(data).to.have.length(2)
    expect(text(data[0])).to.equal('abaa')
    expect(text(data[1])).to.equal('abaatest')
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
        <label text='test'>
          <literal text='x' />
        </label>
      </repeat>
    )

    const data = parser.parseArray('xa')
    expect(data).to.have.length(1)
    expect(text(data[0])).to.equal('xaatest')
  })
})
