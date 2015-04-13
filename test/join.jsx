/** @jsx phrase.createElement */
/* eslint-env mocha */
import {expect} from 'chai'
import fulltext from 'lacona-util-fulltext'
import * as lacona from '..'
import * as phrase from 'lacona-phrase'

function from(i) {const a = []; for (let x of i) a.push(x); return a}

describe('join', () => {
  var parser

  beforeEach(() => {
    parser = new lacona.Parser()
  })

  it('joins literals onto the suggestion', () => {
    parser.grammar = (
      <sequence>
        <literal text='aaa' />
        <literal text='bbb' join={true} />
      </sequence>
    )

    const data = from(parser.parse('a'))
    expect(data).to.have.length(1)
    expect(fulltext.suggestion(data[0])).to.equal('aaabbb')
  })

  it('inherits joins', () => {
    parser.grammar = (
      <sequence>
        <literal text='aaa' />
        <choice join={true}>
          <literal text='bbb' />
          <literal text='ccc' />
        </choice>
      </sequence>
    )

    const data = from(parser.parse('a'))
    expect(data).to.have.length(2)
    expect(fulltext.suggestion(data[0])).to.equal('aaabbb')
    expect(fulltext.suggestion(data[1])).to.equal('aaaccc')
  })
})
