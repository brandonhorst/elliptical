/*eslint-env mocha*/
import chai, {expect} from 'chai'
import es from 'event-stream'
import fulltext from 'lacona-util-fulltext'
import * as lacona from '..'
import sinon from 'sinon'
import sinonChai from 'sinon-chai'

chai.use(sinonChai)

describe('value', function () {
  var parser
  beforeEach(function () {
    parser = new lacona.Parser()
  })

  it('suggests a value', function (done) {
    var test = lacona.createPhrase({
      name: 'test/test',
      fun: function (input, data, done) {
        data({text: 'disp', value: 'val'})
        done()
      },
      describe: function () {
        return lacona.value({
          compute: this.fun,
          id: 'test'
        })
      }
    })

    function callback (err, data) {
      expect(err).to.not.exist
      expect(data).to.have.length(3)
      expect(data[1].data.result.test).to.equal('val')
      expect(fulltext.suggestion(data[1].data)).to.equal('disp')
      done()
    }

    parser.sentences = [test()]
    es.readArray(['di'])
      .pipe(parser)
      .pipe(es.writeArray(callback))
  })

  it('suggests a value', function (done) {
    var test = lacona.createPhrase({
      name: 'test/test',
      fun: function (input, data, done) {
        data({text: 'disp', value: 'val'})
        done()
      },
      describe: function () {
        return lacona.sequence({children: [
          lacona.literal({text: 'test'}),
          lacona.value({
            compute: this.fun,
            id: 'test'
          })
        ]})
      }
    })

    function callback (err, data) {
      expect(err).to.not.exist
      expect(data).to.have.length(3)
      expect(data[1].data.result.test).to.equal('val')
      expect(fulltext.completion(data[1].data)).to.equal('disp')
      done()
    }

    parser.sentences = [test()]
    es.readArray(['te'])
      .pipe(parser)
      .pipe(es.writeArray(callback))
  })

  it('can access props its function', function (done) {
    var spy = sinon.spy()
    var test = lacona.createPhrase({
      name: 'test/test',
      fun: function (input, data, done) {
        expect(this.props.myVar).to.equal('myVal')
        spy()
        done()
      },
      describe: function () {
        return lacona.value({compute: this.fun})
      }
    })

    function callback () {
      expect(spy).to.have.been.calledOnce

      done()
    }

    parser.sentences = [test({myVar: 'myVal'})]
    es.readArray(['di'])
      .pipe(parser)
      .pipe(es.writeArray(callback))
  })

  it('can call functions in props', function (done) {
    var spy = sinon.spy()
    var test = lacona.createPhrase({
      name: 'test/test',
      someFun: function () {
        spy()
      },
      describe: function () {
        return dep({propFunction: this.someFun})
      }
    })

    var dep = lacona.createPhrase({
      name: 'test/dep',
      fun: function (input, data, done) {
        this.props.propFunction()
        done()
      },
      describe: function () {
        return lacona.value({compute: this.fun})
      }
    })

    function callback () {
      expect(spy).to.have.been.calledOnce
      done()
    }

    parser.sentences = [test()]
    es.readArray(['di'])
      .pipe(parser)
      .pipe(es.writeArray(callback))
  })
  it('can override fuzzy settings', function (done) {
    var test = lacona.createPhrase({
      name: 'test/test',
      fun: function (input, data, done) {
        data({text: 'tst', value: 'non-fuzzy'})
        data({text: 'test', value: 'fuzzy'})
        done()
      },
      describe: function () {
        return lacona.value({
          compute: this.fun,
          id: 'test',
          fuzzy: 'none'
        })
      }
    })

    function callback (err, data) {
      expect(err).to.not.exist
      expect(data).to.have.length(3)
      expect(fulltext.match(data[1].data)).to.equal('tst')
      expect(data[1].data.result.test).to.equal('non-fuzzy')
      done()
    }

    parser.sentences = [test()]
    parser.fuzzy = 'all'
    es.readArray(['tst'])
      .pipe(parser)
      .pipe(es.writeArray(callback))
  })
})
