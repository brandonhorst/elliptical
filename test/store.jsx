/* eslint-env mocha */

import element from '../src/element'
import createStore from '../src/create-store'
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

  describe ('register', () => {
    it('takes elements whose type returns an observable', () => {
      function Test () {
        return new Observable(observer => {
          observer.next(3)
        })
      }

      const val = store.register(<Test />)
      expect(val).to.equal(3)
    })

    it('passes props and children to the fetch function', () => {
      function Test ({props, children}) {
        expect(children).to.eql(["test"])
        return new Observable(observer => {
          observer.next(props.num)
        })
      }

      const val = store.register(<Test num={3}>test</Test>)
      expect(val).to.equal(3)
    })

    it('memoizes functions with the same type and no props', () => {
      const fetchSpy = spy()
      function Test () {
        return new Observable(observer => {
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
        return new Observable(observer => {
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
        return new Observable(observer => {
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
        return new Observable(observer => {
          observer.next(3)
        })
      }

      store.subscribe({
        next() { nextSpy() }
      })

      store.register(<Test />)
      expect(nextSpy).to.not.have.been.called
    })

    it('calls subscribers on updates after initial load', (done) => {
      const nextSpy = spy()

      function Test () {
        return new Observable(observer => {
          observer.next(3)
          process.nextTick(() => {
            observer.next(4)
          })
        })
      }

      store.subscribe({
        next({element, value}) {
          expect(element).to.eql({
            type: Test,
            attributes: {},
            children: []
          })
          expect(value).to.equal(4)
          nextSpy()
        }
      })

      store.register(<Test />)
      expect(nextSpy).to.not.have.been.called
      process.nextTick(() => {
        expect(nextSpy).to.have.been.calledOnce
        done()
      })
    })

    it('allows unsubscription', (done) => {
      const nextSpy = spy()

      function Test () {
        return new Observable(observer => {
          observer.next(3)
          process.nextTick(() => {
            observer.next(4)
          })
        })
      }

      const subscription = store.subscribe({
        next() { nextSpy() }
      })

      store.register(<Test />)
      expect(nextSpy).to.not.have.been.called
      subscription.unsubscribe()
      process.nextTick(() => {
        expect(nextSpy).to.not.been.called
        done()
      })
    })
  })
})