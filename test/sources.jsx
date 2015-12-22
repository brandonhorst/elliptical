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
      observe () {return <TestSource />}
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
      observe () {return <TestSource />}
      describe () {return null}
    }

    parser.grammar = <Test />
    parser.reconcile()
    parser.activate()
    expect(fetchSpy).to.not.have.been.called
    parser.deactivate()
    expect(fetchSpy).to.have.been.calledOnce
  })

  it('can set initial data in class properties', () => {
    class TestSource extends Source {
      data = 'testa'
    }

    class Test extends Phrase {
      describe () {return <literal text={this.source.data} />}
      observe () {return <TestSource />}
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
      observe () {
        if (this.props.useSource) {
          return <TestSource />
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

  it('can use props in data property initializer', () => {
    class TestSource extends Source {
      data = this.props.test
    }

    class Test extends Phrase {
      describe () {return <literal text={this.source.data} />}
      observe () {return <TestSource test='testa' />}
    }

    parser.grammar = <Test />

    const data = parser.parseArray('')
    expect(data).to.have.length(1)
    expect(text(data[0])).to.equal('testa')
  })

  it('sources with the same props share', () => {
    class TestSource extends Source {
      data = 'testa'
      set (input) {
        this.setData(input)
      }
    }

    class Test extends Phrase {
      create () {this.source.set('testb')}
      observe () {return <TestSource />}
      describe () {return <literal text={this.source.data} />}
    }
    class Test2 extends Phrase {
      observe () {return <TestSource />}
      describe () {return <literal text={this.source.data} />}
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


  it('sources with the same props do not share if preventSharing is set', () => {
    class TestSource extends Source {
      data = 'testa'

      static preventSharing = true

      set (input) {
        this.setData(input)
      }
    }

    class Test extends Phrase {
      create () {this.source.set('testb')}
      observe () {return <TestSource />}
      describe () {return <literal text={this.source.data} />}
    }
    class Test2 extends Phrase {
      observe () {return <TestSource />}
      describe () {return <literal text={this.source.data} />}
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

  it('sources with different props do not share', () => {
    class TestSource extends Source {
      data = 'testa'

      set (input) {
        this.setData(input)
      }
    }

    class Test extends Phrase {
      create () {this.source.set('testb')}
      observe () {return <TestSource id='something' />}
      describe () {return <literal text={this.source.data} />}
    }
    class Test2 extends Phrase {
      observe () {return <TestSource />}
      describe () {return <literal text={this.source.data} />}
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

  it('can export functions, which can be called on create', () => {
    class TestSource extends Source {
      data = 'testa'

      update () {
        this.setData('testb')
      }
    }

    class Test extends Phrase {
      observe () {return <TestSource />}
      create () {this.source.update()}
      describe () {return <literal text={this.source.data} />}
    }

    parser.grammar = <Test />

    const data = parser.parseArray('')
    expect(text(data[0])).to.equal('testb')
  })

  it('parses are not redescribed if data does not change', () => {
    const descSpy = spy()

    class TestSource extends Source {
      data = 'testa'
    }

    class Test extends Phrase {
      observe () {return <TestSource />}
      describe () {
        descSpy()
        return <literal text={this.source.data} />
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
      data = 'testa'

      onCreate () {
        process.nextTick(() => this.setData('testb'))
      }
    }

    class Test extends Phrase {
      observe () {return <TestSource />}
      create () {consSpy()}
      describe () {return <literal text={this.source.data} />}
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
      data = 'testa'

      onCreate () {
        process.nextTick(() => this.setData('testb'))
      }
    }

    class SubTest extends Phrase {
      create () {subConsSpy('sub')}
      describe () {return <literal text={this.props.val} />}
    }

    class Test extends Phrase {
      create () { consSpy('main') }
      observe () {return <TestSource />}
      describe () {return <SubTest val={this.source.data} />}
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

  it("onReparse is not called for setData() during onCreate", () => {
    const changeSpy = spy()

    class TestSource extends Source {
      data = 'test'

      onCreate () {
        this.setData('another test')
      }
    }

    class Test extends Phrase {
      observe () {return <TestSource /> }

      describe () { return <literal text={this.source.data} /> }
    }

    parser.grammar = <Test />
    parser.onReparse = changeSpy

    const data = parser.parseArray('')
    expect(data).to.have.length(1)
    expect(text(data[0])).to.equal('another test')
    expect(changeSpy).to.not.have.been.called
  })

  it('setData calls onReparse when it occurs after a parse', (done) => {
    class TestSource extends Source {
      data = 'testa'

      onCreate () {
        process.nextTick(() => this.setData('testb'))
      }
    }

    class Test extends Phrase {
      observe () {return <TestSource />}
      describe () {
        return <literal text={this.source.data} />
      }
    }

    parser.onReparse = () => {
      const data = parser.parseArray('')
      expect(data).to.have.length(1)
      expect(text(data[0])).to.equal('testb')
      done()
    }

    parser.grammar = <Test />

    const data = parser.parseArray('')
    expect(data).to.have.length(1)
    expect(text(data[0])).to.equal('testa')
  })

  it('can contain other sources', () => {
    class TestSource1 extends Source {
      data = 'test'
    }
    class TestSource2 extends Source {
      onCreate () {
        this.setData(this.source.data)
      }

      observe () {
        return <TestSource1 />
      }
    }

    class Test extends Phrase {
      observe () {return <TestSource2 />}
      describe () { return <literal text={this.source.data} /> }
    }

    parser.grammar = <Test />

    const data = parser.parseArray('')
    expect(data).to.have.length(1)
    expect(text(data[0])).to.equal('test')
  })

  it("onUpdate is called when a source's source updates", done => {
    class TestSource1 extends Source {
      data = 'test'

      onCreate () {
        process.nextTick(() => {
          this.setData('another test')
        })
      }
    }
    class TestSource2 extends Source {
      data = 'wrong'

      observe () { return <TestSource1 /> }

      onUpdate () { this.setData(this.source.data) }
    }

    class Test extends Phrase {
      observe () {return <TestSource2 /> }

      describe () { return <literal text={this.source.data} /> }
    }

    parser.grammar = <Test />

    const data = parser.parseArray('')
    expect(data).to.have.length(1)
    expect(text(data[0])).to.equal('wrong')

    process.nextTick(() => {
      const data = parser.parseArray('')
      expect(data).to.have.length(1)
      expect(text(data[0])).to.equal('another test')
      done()
    })
  })

  it("can have other sources as their children, data is available at onCreate", () => {
    class TestSource1 extends Source {
      data = 'test'
    }

    class TestSource2 extends Source {
      onCreate () {
        this.setData(this.source.data)
      }
      observe () {
        return this.props.children[0]
      }
    }

    class Test extends Phrase {
      observe () { return  <TestSource2><TestSource1 /></TestSource2> }
      describe () { return <literal text={this.source.data} /> }
    }

    parser.grammar = <Test />

    const data = parser.parseArray('')
    expect(data).to.have.length(1)
    expect(text(data[0])).to.equal('test')
  })

  it("can have Source definitions as their props, data is available at onCreate", () => {
    class TestSource1 extends Source {
      data = 'test'
    }

    class TestSource2 extends Source {
      onCreate () {
        this.setData(this.source.data)
      }

      observe () {
        return <this.props.Source />
      }
    }

    class Test extends Phrase {
      observe () {return <TestSource2 Source={TestSource1} /> }
      describe () { return <literal text={this.source.data} /> }
    }

    parser.grammar = <Test />

    const data = parser.parseArray('')
    expect(data).to.have.length(1)
    expect(text(data[0])).to.equal('test')
  })

})
