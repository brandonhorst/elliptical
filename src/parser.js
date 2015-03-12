import _ from 'lodash'
import asyncEach from 'async-each'
import {createOption} from './input-option'
import Phrase from './phrase'
import stream from 'stream'
import updateList from './utils/update-list'

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

    this._sentenceInstances = []
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
    const input = createOption({
      fuzzy: this.fuzzy,
      text: input,
      sentence: sentence.element
    })
    const options = {
      langs: this.langs,
      getExtensions: this._getExtensions.bind(this),
      generatePhraseParseId: () => _.uniqueId
    }

    for (let output of sentence.parse(input, options)) {
      if (output.get('text') === '') {
        output.get('callbacks').forEach(callback => callback())
        const finalOutput = output.set('result', output.get('result').get(sentence.props.id))
        this.push({
          event: 'data',
          data: normalizeOutput(finalOutput)
        })
      }
    }
  }

  _transform(input, encoding, callback) {
    // Do not accept non-string input
    if (!_.isString(input)) {
      return callback(new Error('parse input must be a string'))
    }

    this.push({event: 'start'})

    this._sentenceInstances = updateList(
      this.sentences,
      this._sentenceInstances,
      instance => instance.descriptor,
      descriptor => new Phrase(descriptor)
    )

    this._sentenceInstances.forEach(sentence => this.parseSentence(sentence, input))

    this.push({event: 'end'})

    callback()
  }
}
