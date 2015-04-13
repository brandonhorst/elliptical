/** @jsx phrase.createElement */
/* eslint-env mocha */
import {expect} from 'chai'
import fulltext from 'lacona-util-fulltext'
import * as lacona from '..'
import * as phrase from 'lacona-phrase'

function from(i) {const a = []; for (let x of i) a.push(x); return a}

describe('category', () => {
  let parser

  beforeEach(() => {
    parser = new lacona.Parser()
  })

  it('passes a category to the OutputOption', () => {
    parser.grammar = <literal text='test' category='myCat' />

    const data = from(parser.parse('t'))
    expect(data).to.have.length(1)
    expect(data[0].suggestion[0].category).to.equal('myCat')
  })

  it('custom phrases can modify the category', () => {
    class Test extends phrase.Phrase {
      describe() {
        return <literal text='test' category={this.props.category + 'Modified'} />
      }
    }

    parser.grammar = <Test category='myCat' />

    const data = from(parser.parse('t'))
    expect(data).to.have.length(1)
    expect(data[0].suggestion[0].category).to.equal('myCatModified')
  })

  it('elements will inherit the category if none is specified', () => {
    class Test extends phrase.Phrase {
      describe() {
        return <literal text='test' />
      }
    }

    parser.grammar = <Test category='myCat' />

    const data = from(parser.parse('t'))
    expect(data).to.have.length(1)
    expect(data[0].suggestion[0].category).to.equal('myCat')
  })
})
