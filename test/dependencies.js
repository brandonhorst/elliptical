/*eslint-env mocha*/
import {expect} from 'chai'
import es from 'event-stream'
import fulltext from 'lacona-util-fulltext'
import * as lacona from '..'

describe('dependencies', function () {
  var parser
  beforeEach(function () {
    parser = new lacona.Parser()
  })

  it('handles basic dependencies', function (done) {
    var dep = lacona.createPhrase({
      name: 'test/dep',
      describe: function () {
        return lacona.literal({text: 'something'})
      }
    })

    var test = lacona.createPhrase({
      name: 'test/test',
      describe: function () {
        return dep()
      }
    })

    function callback (err, data) {
      expect(err).to.not.exist
      expect(data).to.have.length(3)
      expect(fulltext.suggestion(data[1].data)).to.equal('something')
      done()
    }

    parser.sentences = [test()]
    es.readArray(['s'])
      .pipe(parser)
      .pipe(es.writeArray(callback))
  })
})
