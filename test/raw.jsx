/** @jsx phrase.createElement */
/* eslint-env mocha */
import chai, {expect} from 'chai'
import {text} from './_util'
import * as lacona from '..'
import * as phrase from 'lacona-phrase'

describe('raw', function () {
  var parser

  beforeEach(function () {
    parser = new lacona.Parser()
  })

  it('suggests a item', () => {
    function fun() {
      return [{
        remaining: null,
        result: 'val',
        words: [{text: 'tex', input: false}]
      }]
    }

    parser.grammar = <raw function={fun} />

    const data = parser.parseArray('')
    expect(data).to.have.length(1)
    expect(data[0].result).to.equal('val')
    expect(text(data[0])).to.equal('tex')
  })

  it('suggests a item (generator)', () => {
    function *fun() {
      yield {
        remaining: null,
        result: 'val',
        words: [{text: 'tex', input: false}]
      }
    }

    parser.grammar = <raw function={fun} />

    const data = parser.parseArray('')
    expect(data).to.have.length(1)
    expect(data[0].result).to.equal('val')
    expect(text(data[0])).to.equal('tex')
  })

  it('computes a value', () => {
    function fun(input) {
      expect(input).to.equal('te')
      return [{
        remaining: '',
        result: 'val',
        words: [{text: 'te', input: true}, {text: 'x', input: false}]
      }]
    }

    parser.grammar = <raw function={fun} />

    const data = parser.parseArray('te')
    expect(data).to.have.length(1)
    expect(data[0].result).to.equal('val')
    expect(text(data[0])).to.equal('tex')
  })

  it('computes a value (generator)', () => {
    function *fun(input) {
      expect(input).to.equal('te')
      yield {
        remaining: '',
        result: 'val',
        words: [{text: 'te', input: true}, {text: 'x', input: false}]
      }
    }

    parser.grammar = <raw function={fun} />

    const data = parser.parseArray('te')
    expect(data).to.have.length(1)
    expect(data[0].result).to.equal('val')
    expect(text(data[0])).to.equal('tex')
  })

  it('can access props its function (if bound)', () => {
    class Test extends phrase.Phrase {
      fun() {
        expect(this.props.myVar).to.equal('myVal')
        return [{
          remaining: '',
          result: 'val',
          words: [{text: 'tex', input: true}]
        }]
      }

      describe() { return <raw function={this.fun.bind(this)} /> }
    }

    parser.grammar = <Test myVar='myVal' />

    const data = parser.parseArray('')
    expect(data).to.have.length(1)
    expect(text(data[0])).to.equal('tex')
    expect(data[0].result).to.equal('val')
  })

  it('can set the score', () => {
    function fun(input) {
      return [{
        words: [{text: 'test', input: true}],
        result: 'val',
        remaining: '',
        score: 0.5
      }]
    }

    parser.grammar = <raw function={fun} />

    const data = parser.parseArray('')
    expect(data).to.have.length(1)
    expect(data[0].score).to.equal(0.5)
  })
})
