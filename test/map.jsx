/* eslint-env mocha */
/** @jsx createElement */

import _ from 'lodash'
import createElement from '../src/element'
import {compileAndTraverse, text} from './_util'
import chai, {expect} from 'chai'
import {spy} from 'sinon'

chai.use(require('sinon-chai'))

describe('map', () => {
  it('maps an option outbound', () => {
    function addIng (option) {
      return _.assign({}, option, {result: `${option.result}ing`})
    }

    const grammar = (
      <map outbound={addIng}>
        <literal text='test' value='test' />
      </map>
    )
    const options = compileAndTraverse(grammar, 'test')

    expect(options).to.eql([{
      text: '',
      words: [{text: 'test', input: true}],
      result: 'testing',
      score: 1,
      qualifiers: []
    }])
  })

  it('maps an option inbound', () => {
    function changeText (option) {
      return _.assign({}, option, {text: 'te'})
    }

    const grammar = (
      <map inbound={changeText}>
        <literal text='test' value='test' />
      </map>
    )
    const options = compileAndTraverse(grammar, 'nothing')

    expect(options).to.eql([{
      text: null,
      words: [{text: 'te', input: true}, {text: 'st', input: false}],
      result: 'test',
      score: 1,
      qualifiers: []
    }])
  })

  it('maps an element\'s result with an iterator', () => {
    function * addSuffixes (option) {
      yield _.assign({}, option, {result: `${option.result}ing`})
      yield _.assign({}, option, {result: `${option.result}ed`})
    }

    const grammar = (
      <map outbound={addSuffixes}>
        <literal text='test' value='test' />
      </map>
    )
    const options = compileAndTraverse(grammar, 'test')
    expect(options).to.have.length(2)
    expect(options[0].result).to.eql('testing')
    expect(options[1].result).to.eql('tested')
  })

  it('maps an element\'s result with an iterator, and can be limited', () => {
    function * addSuffixes (option) {
      yield _.assign({}, option, {result: `${option.result}ing`})
      yield _.assign({}, option, {result: `${option.result}ed`})
    }

    const grammar = (
      <map outbound={addSuffixes} limit={1}>
        <literal text='test' value='test' />
      </map>
    )

    const options = compileAndTraverse(grammar, 'test')
    expect(options).to.have.length(1)
    expect(options[0].result).to.eql('testing')
  })

  it("maps an element's result, but not if there is a placeholder and skipIncomplete", () => {
    const mapSpy = spy()
    function addIng (option) {
      mapSpy()
      return _.assign({}, option, {result: `${option.result}ing`})
    }

    const grammar = (
      <map outbound={addIng} skipIncomplete>
        <label text='label'>
          <literal text='test' value='test' />
        </label>
      </map>
    )
    let options

    options = compileAndTraverse(grammar, '')
    expect(options).to.have.length(1)
    expect(text(options[0])).to.equal('label')
    expect(mapSpy).to.not.have.been.called
    expect(options[0].result).to.be.undefined

    options = compileAndTraverse(grammar, 't')
    expect(options).to.have.length(1)
    expect(text(options[0])).to.equal('test')
    expect(mapSpy).to.have.been.calledOnce
    expect(options[0].result).to.eql('testing')
  })
})
