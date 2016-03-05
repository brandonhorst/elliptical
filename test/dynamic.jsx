/* eslint-env mocha */

import _ from 'lodash'
import element from '../src/element'
import Observable from 'zen-observable'
import {reconcileAndTraverse} from './_util'
import createStore from '../src/create-store'

import {spy} from 'sinon'
import chai, {expect} from 'chai'
import sinonChai from 'sinon-chai'

chai.use(sinonChai)

describe('dynamic', () => {
  it('calls observe for a specific input', () => {
    function Test ({props}) {
      expect(props).to.eql({input: 't'})
      return new Observable(observer => {
        observer.next('test')
      })
    }

    function observe (input) {
      return <Test input={input} />
    }

    function describe ({data}) {
      return <literal text={data} value={data} />
    }

    const store = createStore()
    const grammar = <dynamic observe={observe} describe={describe} />
    const options = reconcileAndTraverse(grammar, 't', store.register)

    expect(options).to.eql([{
      text: null,
      words: [{text: 't', input: true}, {text: 'est', input: false}],
      result: 'test',
      score: 1,
      qualifiers: []
    }]);
  })

  it('calls observe for a specific input, and handles async data', (done) => {
    function Test () {
      return new Observable(observer => {
        process.nextTick(() => {
          observer.next('totally')
        })
      })
    }

    function observe (input) {
      return <Test input={input} />
    }

    function describe ({data = 'test'}) {
      return <literal text={data} value={data} />
    }

    const grammar = <dynamic observe={observe} describe={describe} consumeAll />
    const store = createStore()
    const options = reconcileAndTraverse(grammar, 't', store.register)
    expect(options).to.eql([{
      text: null,
      words: [{text: 't', input: true}, {text: 'est', input: false}],
      result: 'test',
      score: 1,
      qualifiers: []
    }]);

    process.nextTick(() => {
      const options = reconcileAndTraverse(grammar, 't', store.register)
      expect(options).to.eql([{
        text: null,
        words: [{text: 't', input: true}, {text: 'otally', input: false}],
        result: 'totally',
        score: 1,
        qualifiers: []
      }]);

      done()
    })
  })

  it('calls fetch for two different inputs on the same parse', () => {
    function Test ({props}) { 
      return new Observable(observer => {
        observer.next(`${props.input}batman${props.input}`)
      })
    }

    function fetch (input) {
      return <Test input={input} />
    }

    function describe ({data}) {
      return <literal text={data} value={data} />
    }

    const grammar = (
      <choice>
        <sequence>
          <literal text='test' />
          <dynamic observe={fetch} describe={describe} id='dynamic' consumeAll />
        </sequence>
        <dynamic observe={fetch} describe={describe} id='dynamic' consumeAll />
      </choice>
    )
    const store = createStore()

    const options = reconcileAndTraverse(grammar, 'testb', store.register)
    expect(options).to.eql([{
      text: null,
      words: [
        {text: 'test', input: true},
        {text: 'b', input: true},
        {text: 'batmanb', input: false}
      ],
      result: {dynamic:'bbatmanb'},
      score: 1,
      qualifiers: []
    }, {
      text: null,
      words: [
        {text: 'testb', input: true},
        {text: 'batmantestb', input: false}
      ],
      result: {dynamic: 'testbbatmantestb'},
      score: 1,
      qualifiers: []
    }]);
  })

  it('is fine if an observe call returns nothing', () => {
    function Test ({props}) {
      return new Observable(observer => {
        observer.next(`${props.input}superman`)
      })
    }

    function fetch (input) {
      if (input != null) {
        return <Test input={input} />
      }
    }

    function describe ({data = 'test'}) {
      return <literal text={data} value='aaa' />
    }

    const grammar = (
      <choice>
        <sequence>
          <literal text='test' />
          <dynamic observe={fetch} describe={describe} id='dynamic' consumeAll />
        </sequence>
        <dynamic observe={fetch} describe={describe} id='dynamic' consumeAll />
      </choice>
    )

    const store = createStore()
    const options = reconcileAndTraverse(grammar, 'tes', store.register)
    expect(options).to.eql([{
      text: null,
      words: [
        {text: 'tes', input: true},
        {text: 't', input: false},
        {text: 'test', input: false}
      ],
      result: {dynamic: 'aaa'},
      score: 1,
      qualifiers: []
    }, {
      text: null,
      words: [
        {text: 'tes', input: true},
        {text: 'superman', input: false}
      ],
      result: {dynamic: 'aaa'},
      score: 1,
      qualifiers: []
    }]);
  })

  it('calls observe for multiple splits', () => {
    const observeSpy = spy()

    function observe (input) {
      observeSpy(input)
    }

    const grammar = <dynamic observe={observe} describe={() => {}} splitOn=' ' />
    reconcileAndTraverse(grammar, 'b t')
    expect(observeSpy).to.have.been.calledTwice
    expect(observeSpy).to.have.been.calledWith('b')
    expect(observeSpy).to.have.been.calledWith('b t')
  })

  it('can be limited', () => {
    function describe (data) {
      return <literal text='b test' />
    }

    const grammar = <dynamic describe={describe} splitOn=' ' limit={1} />

    const store = createStore()
    const options = reconcileAndTraverse(grammar, 'b test', store.register)
    expect(options).to.have.length(1)
  })

  it('can be greedy', () => {
    function Test ({props}) {
      return new Observable(observer => {
        observer.next(props.input)
      })
    }

    function observe (input) {
      return <Test input={input} />
    }

    function describe ({data}) {
      return <literal text={data} value={data} />
    }

    const grammar = (
      <sequence>
        <dynamic observe={observe} describe={describe} splitOn=' ' greedy />
        <literal text=' test' />
      </sequence>
    )
    const store = createStore()
    const options = reconcileAndTraverse(grammar, 'b t', store.register)
    expect(options).to.eql([{
      text: null,
      words: [
        {text: 'b t', input: true},
        {text: ' test', input: false}
      ],
      result: {},
      score: 1,
      qualifiers: []
    }, {
      text: null,
      words: [
        {text: 'b', input: true},
        {text: ' t', input: true},
        {text: 'est', input: false}
      ],
      result: {},
      score: 1,
      qualifiers: []
    }]);
  })
})
