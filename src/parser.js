import _ from 'lodash'
import asyncEach from 'async-each'
import {createOption} from './input-option'
import LaconaError from './error'
import Phrase from './phrase'
import stream from 'stream'
import updateList from './utils/update-list'

function normalizeOutput (option) {
  var output = _.pick(option, ['match', 'completion', 'result', 'sentence'])
  var newSuggestions = []
  var i, l, lastSuggestion, oldSuggestion

  if (option.suggestion.length > 0) {
    newSuggestions.push(_.clone(option.suggestion[0]))
    for (i = 1, l = option.suggestion.length; i < l; i++) {
      lastSuggestion = newSuggestions[newSuggestions.length - 1]
      oldSuggestion = _.clone(option.suggestion[i])
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
    // this._flushcallback = null
    // this._pending = 0
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

    _.chain(sentence.parse(input, options))
      .filter(output => output.get('text') === '')
      .map(output => output.set('result', output.get('result').get(sentence.element.props.id)))
      .forEach(output => {
        this.push({
          event: 'data',
          data: normalizeOutput(output.toJS())
        })
      })
      .value()
  }

  _transform(input, encoding, callback) {
    // Do not accept non-string input
    if (!_.isString(input)) {
      return callback(new LaconaError('parse input must be a string'))
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
    // asyncEach(this._sentenceInstances, parseSentence, allPhrasesDone)
    //
    // const addLimit = (phraseParseId, limit) => {
    //   if (!limits[phraseParseId]) {
    //     limits[phraseParseId] = limit
    //   }
    // }
    //
    // const handleLimitCache = () => {
    //   // for each phraseParseId, make an array of all of the limitValues submitted
    //   var maxNums = _.chain(limitCache).pluck('limit').reduce((acc, limit) => {
    //     _.forEach(limit, (limitValue, phraseParseId) => {
    //       if (acc[phraseParseId]) {
    //         acc[phraseParseId].push(limitValue)
    //       } else {
    //         acc[phraseParseId] = [limitValue]
    //       }
    //     })
    //     return acc
    //   // sort them numerically and uniquify them (these could be reordered if that would enhance perf)
    //   }, {}).mapValues((value) => _.sortBy(value))
    //   .mapValues((value) => _.uniq(value, true))
    //   // return the maximum limitValue caceptable for each phraseParseId
    //   .mapValues((value, key) =>
    //     limits[key] > value.length ? value[value.length - 1] : value[limits[key] - 1]
    //   ).value()
    //
    //   _.forEach(limitCache, (value) => {
    //     if (_.every(value.limit, (dataNum, phraseParseId) => dataNum <= maxNums[phraseParseId])) {
    //       this.push({
    //         event: 'data',
    //         id: currentParseNumber,
    //         data: normalizeOutput(value.toJS()),
    //         group: group
    //       })
    //     }
    //   })
    // }

    // const allPhrasesDone = (err) => {
    //   if (err) {
    //     this.emit('error', err)
    //   } else {
    //     handleLimitCache()
    //
    //
    //     this._pending--
    //     if (this._pending === 0 && this._flushcallback) {
    //       this._flushcallback()
    //     }
    //   }
    // }

  }

  // _flush(callback) {
  //   if (this._pending === 0) {
  //     callback()
  //   } else {
  //     this._flushcallback = callback
  //   }
  // }
}
