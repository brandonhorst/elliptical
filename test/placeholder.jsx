/** @jsx phrase.createElement */
/* eslint-env mocha */
import {expect} from 'chai'
import fulltext from 'lacona-util-fulltext'
import * as lacona from '..'
import * as phrase from 'lacona-phrase'

function from(i) {const a = []; for (let x of i) a.push(x); return a}

describe('placeholder', function () {
  var parser

  beforeEach(function () {
    parser = new lacona.Parser()
  })

  it('handles a placeholder', () => {
    parser.sentences = [
      <sequence>
        <literal text='a ' />
        <choice limit={1}>
          <placeholder text='test' />
          <literal text='literal' />
        </choice>
      </sequence>
    ]
    const data1 = from(parser.parse(''))
    expect(data1).to.have.length(1)
    expect(fulltext.all(data1[0])).to.equal('a test')

    const data2 = from(parser.parse('a'))
    expect(data2).to.have.length(1)
    expect(fulltext.all(data2[0])).to.equal('a test')

    const data3 = from(parser.parse('a '))
    expect(data3).to.have.length(1)
    expect(fulltext.all(data3[0])).to.equal('a literal')

    const data4 = from(parser.parse('a l'))
    expect(data4).to.have.length(1)
    expect(fulltext.all(data4[0])).to.equal('a literal')

    const data5 = from(parser.parse('a t'))
    expect(data5).to.have.length(0)
  })
})
