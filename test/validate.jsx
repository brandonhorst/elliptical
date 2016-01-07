/** @jsx createElement */
/* eslint-env mocha */
import { createElement, Phrase } from 'lacona-phrase'
import chai, { expect } from 'chai'
import { Parser } from '..'
import { text } from './_util'
import { spy } from 'sinon'
import sinonChai from 'sinon-chai'

chai.use(sinonChai)

describe('validate', () => {
  var parser

  beforeEach(() => {
    parser = new Parser()
  })

  it('validates an output', () => {
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


  it('does not validate with placeholders', () => {
    const valSpy = spy()

    class Test extends Phrase {
      validate (result) {
        valSpy()
        return true
      }

      describe () {
        return (
          <label text='test'>
            <literal text='s' />
          </label>
        )
      }
    }

    parser.grammar = <Test />

    const data = parser.parseArray('')
    expect(data).to.have.length(1)
    expect(valSpy).to.not.have.been.called
    expect(text(data[0])).to.equal('test')
    expect(data[0].result).to.be.undefined
  })
})
