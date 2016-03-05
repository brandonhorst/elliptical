/* eslint-env mocha */

import literal from '../src/elements/literal'
import element from '../src/element'
import reconcile from '../src/reconcile'
import {reconcileAndTraverse, text} from './_util'
import chai, {expect} from 'chai'
import {spy} from 'sinon'

chai.use(require('sinon-chai'))

describe('map', () => {
  it('maps an element\'s result', () => {
    function addIng (result) {
      return `${result}ing`
    }

    const grammar = (
      <map func={addIng}>
        <literal text='test' value='test' />
      </map>
    )
    const options = reconcileAndTraverse(grammar, 'test')

    expect(options).to.eql([{
      text: '',
      words: [{text: 'test', input: true}],
      result: 'testing',
      score: 1,
      qualifiers: []
    }]);
  })

  it('maps an element\'s result with an iterator', () => {
    function * addSuffixes (result) {
      yield `${result}ing`
      yield `${result}ed`
    }

    const grammar = (
      <map flat func={addSuffixes}>
        <literal text='test' value='test' />
      </map>
    )
    const options = reconcileAndTraverse(grammar, 'test')
    expect(options).to.have.length(2)
    expect(options[0].result).to.eql('testing')
    expect(options[1].result).to.eql('tested')
  })

  it('maps an element\'s result with an iterator, and can be limited', () => {
    function * addSuffixes (result) {
      yield `${result}ing`
      yield `${result}ed`
    }

    const grammar = (
      <map flat func={addSuffixes} limit={1}>
        <literal text='test' value='test' />
      </map>
    )

    const options = reconcileAndTraverse(grammar, 'test')
    expect(options).to.have.length(1)
    expect(options[0].result).to.eql('testing')
  })

  it("maps an element's result, but not if there is a placeholder", () => {
    const mapSpy = spy()
    function addIng (result) {
      mapSpy()
      return `${result}ing`
    }

    const grammar = (
      <map func={addIng}>
        <label text='label'>
          <literal text='test' value='test' />
        </label>
      </map>
    )
    let options

    options = reconcileAndTraverse(grammar, '')
    expect(options).to.have.length(1)
    expect(text(options[0])).to.equal('label')
    expect(mapSpy).to.not.have.been.called
    expect(options[0].result).to.be.undefined

    options = reconcileAndTraverse(grammar, 't')
    expect(options).to.have.length(1)
    expect(text(options[0])).to.equal('test')
    expect(mapSpy).to.have.been.calledOnce
    expect(options[0].result).to.eql('testing')
  })
})
