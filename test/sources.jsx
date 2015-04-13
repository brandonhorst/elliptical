/** @jsx createElement */
/* eslint-env mocha */
import chai, {expect} from 'chai'
import fulltext from 'lacona-util-fulltext'
import * as lacona from '..'
import {createElement, Phrase, Source} from 'lacona-phrase'
import {spy} from 'sinon'
import sinonChai from 'sinon-chai'

chai.use(sinonChai)

function from(i) {const a = []; for (let x of i) a.push(x); return a}

describe('sources', () => {
  let parser
  beforeEach(function () {
    parser = new lacona.Parser()
  })

  it('create() is called, can set data', () => {
    class TestSource extends Source {
      create() {this.setData({test: 'testa'})}
    }

    class Test extends Phrase {
      describe() {return <literal text={this.data.test} />}
      source() {return {data: <TestSource />}}
    }

    parser.grammar = <Test />

    const data = from(parser.parse(''))
    expect(data).to.have.length(1)
    expect(fulltext.all(data[0])).to.equal('testa')
  })

  it('passes props to create', () => {
    class TestSource extends Source {
      create() {this.setData({test: this.props.test})}
    }

    class Test extends Phrase {
      describe() {return <literal text={this.data.test} />}
      source() {return {data: <TestSource test='testa' />}}
    }

    parser.grammar = <Test />

    const data = from(parser.parse(''))
    expect(data).to.have.length(1)
    expect(fulltext.all(data[0])).to.equal('testa')
  })

  it('sources with the same props share', () => {
    class TestSource extends Source {
      create() {this.setData({
        test: 'testa',
        set: input => this.setData({test: input})
      })}
    }

    class Test extends Phrase {
      create() {this.data.set('testb')}
      source() {return {data: <TestSource />}}
      describe() {return <literal text={this.data.test} />}
    }
    class Test2 extends Phrase {
      source() {return {data: <TestSource />}}
      describe() {return <literal text={this.data.test} />}
    }

    parser.grammar = <Test />
    const data1 = from(parser.parse(''))
    expect(data1).to.have.length(1)
    expect(fulltext.all(data1[0])).to.equal('testb')

    parser.grammar = <Test2 />
    const data2 = from(parser.parse(''))
    expect(data2).to.have.length(1)
    expect(fulltext.all(data2[0])).to.equal('testb')
  })

  it('sources with different props do not share', () => {
    class TestSource extends Source {
      create() {this.setData({
        test: 'testa',
        set: input => this.setData({test: input})
      })}
    }

    class Test extends Phrase {
      create() {this.data.set('testb')}
      source() {return {data: <TestSource id='something' />}}
      describe() {return <literal text={this.data.test} />}
    }
    class Test2 extends Phrase {
      source() {return {data: <TestSource />}}
      describe() {return <literal text={this.data.test} />}
    }

    parser.grammar = <Test />
    const data1 = from(parser.parse(''))
    expect(data1).to.have.length(1)
    expect(fulltext.all(data1[0])).to.equal('testb')

    parser.grammar = <Test2 />
    const data2 = from(parser.parse(''))
    expect(data2).to.have.length(1)
    expect(fulltext.all(data2[0])).to.equal('testa')
  })

  it('calls create, which can setData', done => {
    class TestSource extends Source {
      create() {
        this.setData({test: 'testa'})
        process.nextTick(() => this.setData({test: 'testb'}))
      }
    }

    class Test extends Phrase {
      source() {return {data: <TestSource />}}
      describe() {return <literal text={this.data.test} />}
    }

    parser.grammar = <Test />

    const data1 = from(parser.parse('test'))
    expect(fulltext.all(data1[0])).to.equal('testa')

    process.nextTick(() => {
      const data2 = from(parser.parse('test'))
      expect(fulltext.all(data2[0])).to.equal('testb')
      done()
    })
  })

  it('can export functions, which can be called on create', () => {
    class TestSource extends Source {
      create() {
        this.setData({
          test: 'testa',
          update: () => this.setData({'test': 'testb'})
        })
      }
    }

    class Test extends Phrase {
      create() {this.data.update()}
      source() {return {data: <TestSource />}}
      describe() {return <literal text={this.data.test} />}
    }

    parser.grammar = <Test />

    const data = from(parser.parse('test'))
    expect(fulltext.all(data[0])).to.equal('testb')
  })

  it('parses are not redescribed if data does not change', () => {
    const descSpy = spy()

    class TestSource extends Source {
      create() {
        this.setData({test: 'testa'})
      }
    }

    class Test extends Phrase {
      source() {return {data: <TestSource />}}
      describe() {
        descSpy()
        return <literal text={this.data.test} />
      }
    }

    parser.grammar = <Test />

    const data1 = from(parser.parse('test'))
    expect(fulltext.all(data1[0])).to.equal('testa')

    const data2 = from(parser.parse('test'))
    expect(fulltext.all(data2[0])).to.equal('testa')

    expect(descSpy).to.have.been.calledOnce
  })

  it('redescriptions do not recreate entire Phrase', (done) => {
    const consSpy = spy()

    class TestSource extends Source {
      create() {
        this.setData({test: 'testa'})
        process.nextTick(() => this.setData({test: 'testb'}))
      }
    }

    class Test extends Phrase {
      source() {return {data: <TestSource />}}
      create() {consSpy()}
      describe() {return <literal text={this.data.test} />}
    }

    parser.grammar = <Test />

    const data1 = from(parser.parse(''))
    expect(fulltext.all(data1[0])).to.equal('testa')
    expect(consSpy).to.have.been.calledOnce

    process.nextTick(() => {
      const data2 = from(parser.parse(''))
      expect(fulltext.all(data2[0])).to.equal('testb')
      expect(consSpy).to.have.been.calledOnce
      done()
    })
  })

  it('changing props does recreate entire phrase', (done) => {
    const consSpy = spy()
    const subConsSpy = spy()

    class TestSource extends Source {
      create() {
        this.setData({test: 'testa'})
        process.nextTick(() => this.setData({test: 'testb'}))
      }
    }

    class SubTest extends Phrase {
      create() {subConsSpy('sub')}
      describe() {return <literal text={this.props.val} />}
    }

    class Test extends Phrase {
      create() { consSpy('main') }
      source() {return {data: <TestSource />}}
      describe() {return <SubTest val={this.data.test} />}
    }

    parser.grammar = <Test />

    const data1 = from(parser.parse(''))
    expect(fulltext.all(data1[0])).to.equal('testa')
    expect(consSpy).to.have.been.calledOnce
    expect(subConsSpy).to.have.been.calledOnce

    process.nextTick(() => {
      const data2 = from(parser.parse(''))
      expect(fulltext.all(data2[0])).to.equal('testb')
      expect(consSpy).to.have.been.calledOnce
      expect(subConsSpy).to.have.been.calledTwice
      done()
    })
  })

  it('setData does not trigger change event during a parse', (done) => {
    const changeSpy = spy()
    class TestSource extends Source {
      create() {this.setData({test: 'testb'})}
    }

    class Test extends Phrase {
      source() {return {data: <TestSource />}}
      describe() {
        return <literal text='test' />
      }
    }

    parser.on('change', changeSpy)
    parser.grammar = <Test />

    const data = from(parser.parse(''))
    expect(data).to.have.length(1)
    expect(fulltext.all(data[0])).to.equal('test')

    process.nextTick(() => {
      expect(changeSpy).to.not.have.been.called
      done()
    })
  })

  it('setData causes change on nextTick when it occurs after a parse', (done) => {
    const changeSpy = spy()
    class TestSource extends Source {
      create() {
        process.nextTick(() => this.setData({test: 'testb'}))
      }
    }

    class Test extends Phrase {
      source() {return {data: <TestSource />}}
      describe() {
        return <literal text='test' />
      }
    }

    parser.on('change', changeSpy)
    parser.grammar = <Test />

    const data = from(parser.parse(''))
    expect(data).to.have.length(1)
    expect(fulltext.all(data[0])).to.equal('test')

    process.nextTick(() => {
      process.nextTick(() => {
        expect(changeSpy).to.have.been.calledOnce
        done()
      })
    })
  })
})
