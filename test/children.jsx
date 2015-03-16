/** @jsx phrase.createElement */
/* eslint-env mocha */
import {expect} from 'chai'
import fulltext from 'lacona-util-fulltext'
import * as lacona from '..'
import * as phrase from 'lacona-phrase'

function from(i) {const a = []; for (let x of i) a.push(x); return a}

describe('children', () => {
  var parser

  beforeEach(() => {
    parser = new lacona.Parser()
  })

  it('passes children as props', () => {
    class Test extends phrase.Phrase {
      describe() {
        expect(this.props.children).to.have.length(2)
        return this.props.children[1]
      }
    }

    parser.sentences = [
      <Test>
        <literal text='a' />
        <literal text='b' />
      </Test>
    ]

    const data = from(parser.parse(''))
    expect(data).to.have.length(1)
    expect(fulltext.suggestion(data[0])).to.equal('b')
  })

  it('flattens children as props', () => {
    class Test extends phrase.Phrase {
      describe() {
        expect(this.props.children).to.have.length(3)
        return this.props.children[1]
      }
    }

    const literals = [<literal text='b' />, <literal text='c' />]
    parser.sentences = [
      <Test>
        <literal text='a' />
        {literals}
      </Test>
    ]

    const data = from(parser.parse(''))
    expect(data).to.have.length(1)
    expect(fulltext.suggestion(data[0])).to.equal('b')
  })

  it('passes the child result', () => {
    class Test extends phrase.Phrase {
      describe() {
        return this.props.children[0]
      }
    }

    parser.sentences = [
      <Test>
        <literal text='a' value='b' />
      </Test>
    ]

    const data = from(parser.parse(''))
    expect(data).to.have.length(1)
    expect(fulltext.suggestion(data[0])).to.equal('a')
    expect(data[0].result).to.equal('b')
  })
})
