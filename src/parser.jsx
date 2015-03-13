/** @jsx createElement */
import _ from 'lodash'
import asyncEach from 'async-each'
import {createElement} from 'lacona-phrase'
import {createOption} from './input-option'
import parse from './parse'
import reconcile from './reconcile'
import stream from 'stream'

function normalizeOutput (option) {
  let output = _.pick(option.toJS(), ['match', 'completion', 'result', 'sentence'])
  const suggestion = option.get('suggestion').toJS()
  let newSuggestions = []
  let i, l, lastSuggestion, oldSuggestion

  if (suggestion.length > 0) {
    newSuggestions.push(_.clone(suggestion[0]))
    for (i = 1, l = suggestion.length; i < l; i++) {
      lastSuggestion = newSuggestions[newSuggestions.length - 1]
      oldSuggestion = _.clone(suggestion[i])
      if (lastSuggestion.input === oldSuggestion.input && lastSuggestion.category === oldSuggestion.category) {
        lastSuggestion.string = lastSuggestion.string + oldSuggestion.string
      } else {
        newSuggestions.push(oldSuggestion)
      }
    }
  }
  output.suggestion = newSuggestions

  return output
}

export default class Parser extends stream.Transform {
  constructor({langs = ['default'], sentences = [], extensions = [], fuzzy} = {}) {
    super({objectMode: true})

    this.langs = langs
    this.sentences = sentences
    this.extensions = extensions
    this.fuzzy = fuzzy
  }

  _getExtensions(Constructor) {
    return _.reduce(this.extensions, (acc, Extension) => {
      if (_.includes(Extension.supplements, Constructor)) {
        acc.supplementers.push(Extension)
      }
      if (_.includes(Extension.overrides, Constructor)) {
        acc.overriders.push(Extension)
      }
      return acc
    }, {
      supplementers: [],
      overriders: []
    })
  }

  parseSentence(sentence, input) {

  }

  _transform(input, encoding, callback) {
    // Do not accept non-string input
    if (!_.isString(input)) {
      return callback(new Error('parse input must be a string'))
    }

    this.push({event: 'start'})

    const sentences = _.map(this.sentences, sentence => _.merge({}, sentence, {props: {__sentence: true}}))

    const descriptor = (
      <choice id='__sentence'>
        {sentences}
      </choice>
    )

    const input = createOption({
      fuzzy: this.fuzzy,
      text: input
    })
    const options = {
      langs: this.langs,
      getExtensions: this._getExtensions.bind(this)
    }

    this._store = reconcile({descriptor, store: this._store, options})

    for (let output of parse({store: this._store, input, options})) {
      if (output.get('text') === '') {
        output.get('callbacks').forEach(callback => callback())
        const finalOutput = output.set('result', output.get('result').get('__sentence'))
        this.push({
          event: 'data',
          data: normalizeOutput(finalOutput)
        })
      }
    }

    this.push({event: 'end'})

    callback()
  }
}
