/** @jsx createElement */
/* eslint-env mocha */
import {createElement, Phrase} from 'lacona-phrase'
import {expect} from 'chai'
import {Parser} from '..'
import {text} from './_util'

describe('validate', () => {
  var parser

  beforeEach(() => {
    parser = new Parser()
  })

  it('validates an output', () => {
    function filter (result) {
      return result === 'b'
    }

    class Test extends Phrase {
      validate (result) {
        return result === 'b'
      }

      describe () {
        return <list items={[{text: 'a', value: 'a'}, {text: 'b', value: 'b'}]} />
      }
    }

    parser.grammar = <Test />

    const data = parser.parseArray('')
    expect(data).to.have.length(1)
    expect(text(data[0])).to.equal('b')
    expect(data[0].result).to.equal('b')
  })

  it('validates extensions as well', () => {
    function filter (result) {
      return result === 'b'
    }

    class Test extends Phrase {
      validate (result) {
        return result === 'c'
      }

      describe () {
        return <list items={[{text: 'a', value: 'a'}, {text: 'b', value: 'b'}]} />
      }
    }

    class Extension extends Phrase {
      describe () {
        return <list items={[{text: 'c', value: 'c'}, {text: 'd', value: 'd'}]} />
      }
    }

    Extension.extends = [Test]

    parser.grammar = <Test />
    parser.extensions = [Extension]

    const data = parser.parseArray('')
    expect(data).to.have.length(1)
    expect(text(data[0])).to.equal('c')
    expect(data[0].result).to.equal('c')
  })
})
