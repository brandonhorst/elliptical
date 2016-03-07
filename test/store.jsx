/** @jsx createElement */
/* eslint-env mocha */

import createElement from '../src/element'
import createStore from '../src/store'
import Observable from 'zen-observable'
import {spy} from 'sinon'
import chai, {expect} from 'chai'
import sinonChai from 'sinon-chai'

chai.use(sinonChai)

describe('store', () => {
  let store

  beforeEach(() => {
    store = createStore()
  })

  describe('register', () => {
    it('takes elements whose type returns an observable', () => {
      function Test () {
        return new Observable((observer) => {
          observer.next(3)
        })
      }

      const val = store.register(<Test />)
      expect(val).to.equal(3)
    })

    it('passes props and children to the fetch function', () => {
      function Test ({props, children}) {
        expect(children).to.eql(['test'])
        return new Observable((observer) => {
          observer.next(props.num)
        })
      }

      const val = store.register(<Test num={3}>test</Test>)
      expect(val).to.equal(3)
    })

    it('memoizes functions with the same type and no props', () => {
      const fetchSpy = spy()
      function Test () {
        return new Observable((observer) => {
          fetchSpy()
          observer.next(3)
        })
      }

      const val1 = store.register(<Test/>)
      const val2 = store.register(<Test/>)

      expect(val1).to.equal(3)
      expect(val2).to.equal(3)
      expect(fetchSpy).to.have.been.calledOnce
    })

    it('memoizes functions with the same type and props', () => {
      const fetchSpy = spy()
      function Test () {
        return new Observable((observer) => {
          fetchSpy()
          observer.next(3)
        })
      }

      const val1 = store.register(<Test num={3}>test</Test>)
      const val2 = store.register(<Test num={3}>test</Test>)

      expect(val1).to.equal(3)
      expect(val2).to.equal(3)
      expect(fetchSpy).to.have.been.calledOnce
    })

    it('calls returns a new value when the observable updates', (done) => {
      function Test () {
        return new Observable((observer) => {
          observer.next(3)
          process.nextTick(() => {
            observer.next(4)
          })
        })
      }

      const val1 = store.register(<Test />)
      expect(val1).to.equal(3)

      process.nextTick(() => {
        const val2 = store.register(<Test />)
        expect(val2).to.equal(4)
        done()
      })
    })
  })

  describe('subscribe', () => {
    it('does not call subscribers on initial load', () => {
      const nextSpy = spy()

      function Test () {
        return new Observable((observer) => {
          observer.next(3)
        })
      }

      store.data.subscribe({
        next (opt) {
          expect(opt).to.eql({element: <Test />, value: 3})
          nextSpy()
        }
      })

      store.register(<Test />)
      expect(nextSpy).to.have.been.calledOnce
    })

    it('calls subscribers on updates after initial load', (done) => {
      const nextSpy = spy()

      function Test () {
        return new Observable((observer) => {
          observer.next(3)
          process.nextTick(() => {
            observer.next(4)
          })
        })
      }

      store.data.subscribe({
        next (opt) {
          nextSpy(opt)
        }
      })

      store.register(<Test />)
      expect(nextSpy).to.have.been.calledOnce
      expect(nextSpy.args[0][0]).to.eql({element: <Test />, value: 3})
      process.nextTick(() => {
        expect(nextSpy).to.have.been.calledTwice
        expect(nextSpy.args[1][0]).to.eql({element: <Test />, value: 4})
        done()
      })
    })
  })
})
