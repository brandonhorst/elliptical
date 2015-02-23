import asyncEach from 'async-each'
import stream from 'stream'
import _ from 'lodash'

import InputOption from './input-option'
import LaconaError from './error'

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
  constructor(options) {
    super({objectMode: true})

    options = options || {}

    _.defaults(
      this,
      _.pick(options, ['langs', 'sentences', 'extensions', 'fuzzy']),
      {
        langs: ['default'],
        sentences: [],
        extensions: []
      }
    )

    this._currentParseNumber = 0
    this._currentPhraseParseId = 0
    this._flushcallback = null
    this._pending = 0
  }

  _getExtensions(name) {
    return _.reduce(this.extensions, (acc, extension) => {
      if (_.contains(extension.extends, name)) {
        acc.extenders[extension.elementName] = extension
      }
      if (_.contains(extension.overrides, name)) {
        acc.overriders[extension.elementName] = extension
      }

      return acc
    }, {
      extenders: {},
      overriders: {}
    })
  }

  _generatePhraseParseId() {
    return this._currentPhraseParseId++
  }

  _transform(input, encoding, callback) {

    var currentParseNumber = this._currentParseNumber
    var limits = {}
    var limitCache = []

    var inputText
    var group

    // Do not accept non-string input
    if (_.isString(input)) {
      inputText = input
    } else if (_.isObject(input) && _.isString(input.data)) {
      inputText = input.data
      group = input.group
    } else {
      return callback(new LaconaError('parse input must be a string'))
    }

    const addLimit = (phraseParseId, limit) => {
      if (!limits[phraseParseId]) {
        limits[phraseParseId] = limit
      }
    }

    const parseSentence = (phrase, done) => {
      var input = new InputOption({
        fuzzy: this.fuzzy,
        text: inputText,
        sentence: phrase.name,
        group: group
      })
      var options = {
        langs: this.langs,
        addLimit: addLimit,
        getExtensions: this._getExtensions.bind(this),
        generatePhraseParseId: this._generatePhraseParseId.bind(this)
      }

      const sentenceData = (input) => {
        var newInputData, newInput

        // only send the result if the parse is complete
        if (input.text === '') {
          newInputData = input.getData()

          // result should be the result of the phrase
          newInputData.result = input.result[phrase.props.id]
          newInput = new InputOption(newInputData)

          if (_.isEmpty(input.limit)) {
            this.push({
              event: 'data',
              id: currentParseNumber,
              data: normalizeOutput(newInput),
              group: group
            })
          } else {
            limitCache.push(newInput)
          }
        }
      }

      phrase.parse(input, options, sentenceData, done)
    }

    const handleLimitCache = () => {
      // for each phraseParseId, make an array of all of the limitValues submitted
      var maxNums = _.chain(limitCache).pluck('limit').reduce((acc, limit) => {
        _.forEach(limit, (limitValue, phraseParseId) => {
          if (acc[phraseParseId]) {
            acc[phraseParseId].push(limitValue)
          } else {
            acc[phraseParseId] = [limitValue]
          }
        })
        return acc
      // sort them numerically and uniquify them (these could be reordered if that would enhance perf)
      }, {}).mapValues((value) => _.sortBy(value))
      .mapValues((value) => _.uniq(value, true))
      // return the maximum limitValue caceptable for each phraseParseId
      .mapValues((value, key) =>
        limits[key] > value.length ? value[value.length - 1] : value[limits[key] - 1]
      ).value()

      _.forEach(limitCache, (value) => {
        if (_.every(value.limit, (dataNum, phraseParseId) => dataNum <= maxNums[phraseParseId])) {
          this.push({
            event: 'data',
            id: currentParseNumber,
            data: normalizeOutput(value),
            group: group
          })
        }
      })
    }

    const allPhrasesDone = (err) => {
      if (err) {
        this.emit('error', err)
      } else {
        handleLimitCache()

        this.push({
          event: 'end',
          id: currentParseNumber,
          group: group
        })

        this._pending--
        if (this._pending === 0 && this._flushcallback) {
          this._flushcallback()
        }
      }
    }

    this._pending++

    this._currentParseNumber++

    this.push({
      event: 'start',
      id: currentParseNumber,
      group: group
    })

    asyncEach(this.sentences, parseSentence, allPhrasesDone)
    callback()
  }

  _flush(callback) {
    if (this._pending === 0) {
      callback()
    } else {
      this._flushcallback = callback
    }
  }
}
