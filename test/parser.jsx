/** @jsx createElement */
/* eslint-env mocha */

import createElement from '../src/element'
import createParser from '../src/parser'
import Observable from 'zen-observable'
import {expect} from 'chai'

describe('parser', () => {
  it('returns pars, watch, and store', () => {
    const parser = createParser(<literal text='test' />)

    expect(parser.store).to.be.an.instanceof(Object)
    expect(parser.store.data).to.be.an.instanceof(Observable)
    expect(parser.store.register).to.be.an.instanceof(Function)
    expect(parser.parse).to.be.an.instanceof(Function)
    expect(parser.watch).to.be.an.instanceof(Function)

    let outputs
    parser.watch('t').subscribe({
      next (x) { outputs = x }
    })
    expect(outputs).to.eql([{
      text: null,
      words: [{text: 't', input: true}, {text: 'est', input: false}],
      result: undefined,
      score: 1,
      qualifiers: []
    }])
  })

  it('parse traverses', () => {
    const Test = {
      describe () {
        return <literal text='test' />
      }
    }
    const {parse} = createParser(<Test />)

    const outputs = parse('t')

    expect(outputs).to.eql([{
      text: null,
      words: [{text: 't', input: true}, {text: 'est', input: false}],
      result: undefined,
      score: 1,
      qualifiers: []
    }])
  })

  it('watch allows for sources and automatically recompiles', (done) => {
    function Source () {
      return new Observable((observer) => {
        observer.next('test')
        process.nextTick(() => {
          observer.next('totally')
        })
      })
    }

    const Test = {
      observe () {
        return <Source />
      },
      describe ({data}) {
        return <literal text={data} />
      }
    }
    const {watch} = createParser(<Test />)

    let outputs
    watch('t').subscribe({
      next (x) { outputs = x }
    })

    expect(outputs).to.eql([{
      text: null,
      words: [{text: 't', input: true}, {text: 'est', input: false}],
      result: undefined,
      score: 1,
      qualifiers: []
    }])

    process.nextTick(() => {
      expect(outputs).to.eql([{
        text: null,
        words: [{text: 't', input: true}, {text: 'otally', input: false}],
        result: undefined,
        score: 1,
        qualifiers: []
      }])
      done()
    })
  })
})
