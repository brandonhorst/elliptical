/** @jsx createElement */
/* eslint-env mocha */
import _ from 'lodash'
import {expect} from 'chai'
import {text} from './_util'
import * as lacona from '..'
import {createElement, Phrase, Source} from 'lacona-phrase'

describe('sources/map', () => {
  let parser
  beforeEach(function () {
    parser = new lacona.Parser()
  })

  it('Allows mapping of a source', () => {
    class TestSource extends Source {
      onCreate () {
        this.setData(['a', 'b', 'c'])
      }
    }

    class Test extends Phrase {
      observe () {
        return (
          <map function={x => `test${x}`}>
            <TestSource />
          </map>
        )
      }

      describe () {
        return (
          <choice>
            {_.map(this.source.data, x => <literal text={x} />)}
          </choice>
        )
      }
    }

    parser.grammar = <Test />
    const data = parser.parseArray('')
    expect(data).to.have.length(3)
    expect(text(data[0])).to.equal('testa')
    expect(text(data[1])).to.equal('testb')
    expect(text(data[2])).to.equal('testc')
  })
})
