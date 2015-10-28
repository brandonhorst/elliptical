/** @jsx createElement */
/* eslint-env mocha */
import chai, {expect} from 'chai'
import {text} from './_util'
import * as lacona from '..'
import {createElement, Phrase, Source} from 'lacona-phrase'
import {spy} from 'sinon'
import sinonChai from 'sinon-chai'

chai.use(sinonChai)

describe('sources', () => {
  let parser
  beforeEach(function () {
    parser = new lacona.Parser()
  })

  it('calling activate on the parser calls onActivate on all sources', () => {
    const fetchSpy = spy()
    class TestSource extends Source {
       onActivate() {fetchSpy()}
    }

    class Test extends Phrase {
      source () {return {data: <TestSource />}}
      describe () {return null}
    }

    parser.grammar = <Test />
    parser.reconcile()
    parser.activate()
    expect(fetchSpy).to.have.been.calledOnce
  })

  it('calling deactivate on the parser calls onDeactivate on all sources', () => {
    const fetchSpy = spy()
    class TestSource extends Source {
       onDeactivate() {fetchSpy()}
    }

    class Test extends Phrase {
      source () {return {data: <TestSource />}}
      describe () {return null}
    }

    parser.grammar = <Test />
    parser.reconcile()
    parser.activate()
    expect(fetchSpy).to.not.have.been.called
    parser.deactivate()
    expect(fetchSpy).to.have.been.calledOnce
  })

  it('onCreate () is called, can set data', () => {
    class TestSource extends Source {
      onCreate () {this.setData({test: 'testa'})}
    }

    class Test extends Phrase {
      describe () {return <literal text={this.sources.data.data.test} />}
      source () {return {data: <TestSource />}}
    }

    parser.grammar = <Test />

    const data = parser.parseArray('')
    expect(data).to.have.length(1)
    expect(text(data[0])).to.equal('testa')
  })

  it('onDestroy() is called, on destroy', () => {
    const destSpy = spy()
    class TestSource extends Source {
      onDestroy () {destSpy()}
    }

    class Test extends Phrase {
      describe () {return <literal text='test' />}
      source () {
        if (this.props.useSource) {
          return {data: <TestSource />}
        } else {
          return {}
        }
      }
    }

    parser.grammar = <Test useSource={true}/>
    const data1 = parser.parseArray('')
    expect(destSpy).to.not.have.been.called
    expect(data1).to.have.length(1)
    expect(text(data1[0])).to.equal('test')

    parser.grammar = <Test useSource={false}/>
    const data2 = parser.parseArray('')
    expect(destSpy).to.have.been.called
    expect(data2).to.have.length(1)
    expect(text(data2[0])).to.equal('test')
  })

  it('passes props to create', () => {
    class TestSource extends Source {
      onCreate () {this.setData({test: this.props.test})}
    }

    class Test extends Phrase {
      describe () {return <literal text={this.sources.data.data.test} />}
      source () {return {data: <TestSource test='testa' />}}
    }

    parser.grammar = <Test />

    const data = parser.parseArray('')
    expect(data).to.have.length(1)
    expect(text(data[0])).to.equal('testa')
  })

  it('sources with the same props share', () => {
    class TestSource extends Source {
      onCreate () {
        this.setData('testa')
      }
      set (input) {
        this.setData({test: input})
      }
    }

    class Test extends Phrase {
      create () {this.sources.data.set('testb')}
      source () {return {data: <TestSource />}}
      describe () {return <literal text={this.sources.data.data.test} />}
    }
    class Test2 extends Phrase {
      source () {return {data: <TestSource />}}
      describe () {return <literal text={this.sources.data.data.test} />}
    }

    parser.grammar = <Test />
    const data1 = parser.parseArray('')
    expect(data1).to.have.length(1)
    expect(text(data1[0])).to.equal('testb')

    parser.grammar = <Test2 />
    const data2 = parser.parseArray('')
    expect(data2).to.have.length(1)
    expect(text(data2[0])).to.equal('testb')
  })

  it('sources with different props do not share', () => {
    class TestSource extends Source {
      set (input) {
        this.replaceData(input)
      }

      onCreate () {
        this.replaceData('testa')
      }
    }

    class Test extends Phrase {
      create () {this.sources.data.set('testb')}
      source () {return {data: <TestSource id='something' />}}
      describe () {return <literal text={this.sources.data.data} />}
    }
    class Test2 extends Phrase {
      source () {return {data: <TestSource />}}
      describe () {return <literal text={this.sources.data.data} />}
    }

    parser.grammar = <Test />
    const data1 = parser.parseArray('')
    expect(data1).to.have.length(1)
    expect(text(data1[0])).to.equal('testb')

    parser.grammar = <Test2 />
    const data2 = parser.parseArray('')
    expect(data2).to.have.length(1)
    expect(text(data2[0])).to.equal('testa')
  })

  it('calls onCreate, which can setData', done => {
    class TestSource extends Source {
      onCreate () {
        this.replaceData('testa')
        process.nextTick(() => this.replaceData('testb'))
      }
    }

    class Test extends Phrase {
      source () {return {data: <TestSource />}}
      describe () {return <literal text={this.sources.data.data} />}
    }

    parser.grammar = <Test />

    const data1 = parser.parseArray('')
    expect(text(data1[0])).to.equal('testa')

    process.nextTick(() => {
      const data2 = parser.parseArray('')
      expect(text(data2[0])).to.equal('testb')
      done()
    })
  })

  it('can export functions, which can be called on create', () => {
    class TestSource extends Source {
      update () {
        this.replaceData('testb')
      }
      onCreate () {
        this.replaceData('testa')
      }
    }

    class Test extends Phrase {
      source () {return {data: <TestSource />}}
      create () {this.sources.data.update()}
      describe () {return <literal text={this.sources.data.data} />}
    }

    parser.grammar = <Test />

    const data = parser.parseArray('')
    expect(text(data[0])).to.equal('testb')
  })

  it('parses are not redescribed if data does not change', () => {
    const descSpy = spy()

    class TestSource extends Source {
      onCreate () {
        this.replaceData('testa')
      }
    }

    class Test extends Phrase {
      source () {return {data: <TestSource />}}
      describe () {
        descSpy()
        return <literal text={this.sources.data.data} />
      }
    }

    parser.grammar = <Test />

    const data1 = parser.parseArray('')
    expect(text(data1[0])).to.equal('testa')

    const data2 = parser.parseArray('')
    expect(text(data2[0])).to.equal('testa')

    expect(descSpy).to.have.been.calledOnce
  })

  it('redescriptions do not recreate entire Phrase', (done) => {
    const consSpy = spy()

    class TestSource extends Source {
      onCreate () {
        this.replaceData('testa')
        process.nextTick(() => this.replaceData('testb'))
      }
    }

    class Test extends Phrase {
      source () {return {data: <TestSource />}}
      create () {consSpy()}
      describe () {return <literal text={this.sources.data.data} />}
    }

    parser.grammar = <Test />

    const data1 = parser.parseArray('')
    expect(text(data1[0])).to.equal('testa')
    expect(consSpy).to.have.been.calledOnce

    process.nextTick(() => {
      const data2 = parser.parseArray('')
      expect(text(data2[0])).to.equal('testb')
      expect(consSpy).to.have.been.calledOnce
      done()
    })
  })

  it('changing props does recreate entire phrase', (done) => {
    const consSpy = spy()
    const subConsSpy = spy()

    class TestSource extends Source {
      onCreate () {
        this.replaceData('testa')
        process.nextTick(() => this.replaceData('testb'))
      }
    }

    class SubTest extends Phrase {
      create () {subConsSpy('sub')}
      describe () {return <literal text={this.props.val} />}
    }

    class Test extends Phrase {
      create () { consSpy('main') }
      source () {return {data: <TestSource />}}
      describe () {return <SubTest val={this.sources.data.data} />}
    }

    parser.grammar = <Test />

    const data1 = parser.parseArray('')
    expect(text(data1[0])).to.equal('testa')
    expect(consSpy).to.have.been.calledOnce
    expect(subConsSpy).to.have.been.calledOnce

    process.nextTick(() => {
      const data2 = parser.parseArray('')
      expect(text(data2[0])).to.equal('testb')
      expect(consSpy).to.have.been.calledOnce
      expect(subConsSpy).to.have.been.calledTwice
      done()
    })
  })

  it('setData does not trigger change event during a parse', (done) => {
    const changeSpy = spy()
    class TestSource extends Source {
      onCreate () {this.setData({test: 'testb'})}
    }

    class Test extends Phrase {
      source () {return {data: <TestSource />}}
      describe () {
        return <literal text='test' />
      }
    }

    parser.reparse = changeSpy
    parser.grammar = <Test />

    const data = parser.parseArray('')
    expect(data).to.have.length(1)
    expect(text(data[0])).to.equal('test')

    process.nextTick(() => {
      expect(changeSpy).to.not.have.been.called
      done()
    })
  })

  it('setData causes change on nextTick when it occurs after a parse', (done) => {
    const changeSpy = spy()
    class TestSource extends Source {
      onCreate () {
        process.nextTick(() => this.setData({test: 'testb'}))
      }
    }

    class Test extends Phrase {
      source () {return {data: <TestSource />}}
      describe () {
        return <literal text='test' />
      }
    }

    parser.reparse = changeSpy
    parser.grammar = <Test />

    const data = parser.parseArray('')
    expect(data).to.have.length(1)
    expect(text(data[0])).to.equal('test')

    process.nextTick(() => {
      process.nextTick(() => {
        expect(changeSpy).to.have.been.calledOnce
        done()
      })
    })
  })
})
