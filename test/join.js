/*eslint-env mocha*/
import {expect} from 'chai'
import es from 'event-stream'
import fulltext from 'lacona-util-fulltext'
import * as lacona from '..'

describe('join', function () {
  var parser
  beforeEach(function () {
    parser = new lacona.Parser()
  })

  it('joins literals onto the suggestion', function (done) {
    var test = lacona.createPhrase({
      name: 'test/test',
      describe: function () {
        return lacona.sequence({children: [
          lacona.literal({text: 'aaa'}),
          lacona.literal({text: 'bbb', join: true})
        ]})
      }
    })

    function callback (err, data) {
      expect(err).to.not.exist
      expect(data).to.have.length(3)
      expect(fulltext.suggestion(data[1].data)).to.equal('aaabbb')
      done()
    }

    parser.sentences = [test()]

    es.readArray(['a'])
      .pipe(parser)
      .pipe(es.writeArray(callback))
  })
})
