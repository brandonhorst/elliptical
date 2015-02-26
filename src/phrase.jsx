/** @jsx createElement */
import _ from 'lodash'
import asyncEach from 'async-each'
import * as builtins from './elements'
import {createElement} from 'lacona-phrase'
import InputOption from './input-option'
import LaconaError from './error'

var nextTempId = 0

function getBestElementLang (translations, langs) {
  var baseLangs = _.map(langs, function (lang) {
    return lang.split('_')[0]
  })

  return _.chain(langs).concat(baseLangs).find(function (lang) {
    return translations[lang]
  }).value() || 'default'
}

function getConstructor(constructor) {
  let Constructor
  if (_.isString(constructor)) {
    if (_.has(builtins, constructor)) {
      Constructor = builtins[constructor]
    } else {
      throw new LaconaError('Invalid phrase. Note: non-builtin phrases must be uppercase')
    }
  } else {
    Constructor = constructor
  }

  if (Constructor.getSupplements) Constructor.supplements = Constructor.getSupplements()
  if (Constructor.getOverrides) Constructor.overrides = Constructor.getOverrides()
  if (Constructor.getDefaultProps) Constructor.defaultProps = Constructor.getDefaultProps()
  if (Constructor.getInitialAdditions) Constructor.additions = Constructor.getInitialAdditions()
  if (Constructor.getTranslations) Constructor.translations = Constructor.getTranslations()
  if (!Constructor.translations && !Constructor.prototype._handleParse) {
    if (!Constructor.prototype.describe) {
      throw new LaconaError('Phrases must either have translations on the constructor or describe on the prototype')
    } else {
      Constructor.translations = [{langs: ['default'], describe: Constructor.prototype.describe}]
      delete Constructor.prototype.describe
    }
  }
  return Constructor
}

function getElements(Constructor) {
  return _.transform(Constructor.translations, (acc, value) => {
    _.forEach(value.langs, function (lang) {
      acc[lang] = {
        describe: value.describe,
        cache: null
      }
    })
  }, {})
}

function validate(Constructor) {
  if (!Constructor.prototype._handleParse) {
    let hasDefault = false
    if (!_.every(Constructor.translations, _.partial(_.has, _, 'describe'))) {
      throw new LaconaError('Every translation must have a describe method')
    }
    if (!_.every(Constructor.translations, _.partial(_.has, _, 'langs'))) {
      throw new LaconaError('Every translation must have a langs property')
    }
    if (!_.some(Constructor.translations, translation => _.indexOf(translation.langs, 'default') > -1)) {
      throw new LaconaError('All elements must have a describe method defined for the default language')
    }
  }
  return true
}

export default class Phrase {
  constructor({constructor, props, children}) {
    // store the constructor in case it needs to be cloned (by sequence)
    this.elementConstructor = constructor

    // get the actual constructor, as constructor could be a string
    const Constructor = getConstructor(constructor)
    validate(Constructor)

    // get the translations, or handleParse if it is provided
    if (!Constructor.prototype._handleParse) {
      this.translations = getElements(Constructor)
    }

    //normalize props
    let realProps = _.clone(props || {})
    realProps.children = _.flattenDeep(children)
    if (!realProps.id) {realProps.id = _.uniqueId('_temp')}
    realProps = _.defaults(realProps, Constructor.defaultProps)

    //instantiate and validate the constructor
    if (Constructor.prototype._handleParse) {
      this.element = new Constructor(realProps, Phrase)
    } else {
      this.element = new Constructor(realProps)
    }
    this.element.props = realProps

    this.oldAdditions = {}

    // initialize extenders and overriders
    this.supplementers = []
    this.overriders = []
  }

  applyAdditions() {
    _.forEach(this.oldAdditions, (value, name) => {
      delete this.element[name]
    })

    _.forEach(this.elementConstructor.additions, (value, name) => {
      this.element[name] = value
      this.element[`set${_.capitalize(name)}`] = (newValue) => {
        var arg = {[name]: newValue}
        if (this.elementConstructor.additionsCallback) {
          this.elementConstructor.additionsCallback(arg)
        }
      }
    })

    this.oldAdditions = this.elementConstructor.additions
  }

  // given all extensions (from the parser), make sure our cache is up-to-date
  // if it is not, update it
  _checkExtensions(extensions) {
    _.forEach(['supplementers', 'overriders'], name => {
      var cachedExtensions = this[name]
      var currentExtensions = extensions[name]

      var newExtensions = _.difference(currentExtensions, cachedExtensions)
      var removedExtensions = _.difference(cachedExtensions, currentExtensions)

      newExtensions.forEach(NewExtension => {
        this[name].push(new Phrase(<NewExtension {...this.props} />))
      })

      removedExtensions.forEach(RemovedExtension => {
        _.remove(this[name], _.identity, RemovedExtension)
      })
    })
  }

  parse(input, options, data, done) {
    var preParseInputData
    var oldResultStored = input.result
    var phraseRunning = false
    var extendersRunning = true
    var overridersRunning = true
    var overriderGotData = false

    const phraseData = (input) => {
      var newInputData = input.getData()
      var oldResult = _.clone(oldResultStored)

      let newResult = input.clearTemps()
      if (this.element.getValue) newResult = this.element.getValue.call(this.element, newResult)
      if (_.isObject(newResult)) newResult = _.omit(newResult, _.isUndefined)

      oldResult[this.element.props.id] = newResult
      newInputData.result = oldResult

      return sendData(new InputOption(newInputData))
    }

    const phraseDone = () => {
      phraseRunning = false
      checkDoneCondition()
    }

    const extendersDone = () => {
      extendersRunning = false
      checkDoneCondition()
    }

    const checkDoneCondition = () => {
      if (!extendersRunning && !phraseRunning && !overridersRunning) {
        done()
      }
    }

    const sendData = (input) => {
      var newInput = input.getData()
      newInput.stack = input.stackPop()
      data(new InputOption(newInput))
    }

    const overriderData = (newOption) => {
      overriderGotData = true
      sendData(newOption)
    }

    const overridersDone = () => {
      overridersRunning = false
      if (!overriderGotData) {
        parseElement()
      } else {
        checkDoneCondition()
      }
    }
    const doHandleParse = () => {
      var dataNumber, phraseParseId, newInput

      // bound to preParseOptions
      const applyLimit = (input) => {
        var newLimit = input.addLimit(phraseParseId, dataNumber)
        options.addLimit(phraseParseId, this.element.props.limit)
        dataNumber++
        return newLimit
      }

      newInput = new InputOption(preParseInputData)

      if (this.element.props.limit) {
        dataNumber = 0
        phraseParseId = options.generatePhraseParseId()
      }

      this.element._handleParse(newInput, options, applyLimit, sendData, done)
    }

    const doDescribeParse = () => {
      var lang = getBestElementLang(this.translations, options.langs)

      preParseInputData.result = {}

      // if describe has never been executed, execute it and cache it
      if (this.oldAdditions !== this.elementConstructor.additions) {
        this.applyAdditions()
        this.translations[lang].cache = null
      }
      if (!this.translations[lang].cache) {
        this.translations[lang].cache = new Phrase(this.translations[lang].describe.call(this.element))
      }

      this.translations[lang].cache.parse(new InputOption(preParseInputData), options, phraseData, phraseDone)
    }

    const parseElement = () => {
      phraseRunning = true

      // add this to the stack before doing anything
      preParseInputData = input.getData()
      preParseInputData.stack = input.stackPush({
        constructor: this.elementConstructor,
        category: this.element.props.category
      })

      if (this.element._handleParse) {
        doHandleParse()
      } else {
        doDescribeParse()
      }
    }

    // if this is already on the stack, and we've made a suggestion, we need to stop
    // we don't want to cause an infinite loop
    if (
      !_.isString(this.elementConstructor) && // do not apply this restriction to system classes
      input.suggestion.length > 0 &&
      _.find(input.stack, {constructor: this.elementConstructor})
    ) return done()

    // If it is optional, a branch will skip it entirely
    if (this.element.props.optional) {
      data(input)
    }

    if (this.element._handleParse) {
      parseElement()
    } else {
      // Update the extension cache
      this._checkExtensions(options.getExtensions(this.elementConstructor))


      // Check the extenders - don't call done until all are complete
      asyncEach(Object.keys(this.supplementers), (supplementer, done) => {
        this.supplementers[supplementer].parse(input, options, sendData, done)
      }, extendersDone)

      // Check the overriders - don't call phrase parse unless none return data
      asyncEach(Object.keys(this.overriders), (overrider, done) => {
        this.overriders[overrider].parse(input, options, overriderData, done)
      }, overridersDone)
    }
  }
}
