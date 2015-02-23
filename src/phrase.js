import asyncEach from 'async-each'
import _ from 'lodash'

import InputOption from './input-option'

var nextTempId = 0

function getBestElementLang (translations, langs) {
  var baseLangs = _.map(langs, function (lang) {
    return lang.split('_')[0]
  })

  return _.chain(langs).concat(baseLangs).find(function (lang) {
    return translations[lang]
  }).value() || 'default'
}

export default class Phrase {
  constructor(obj, props, factory, guid) {
    // set each property on the class object to be a property on this
    _.assign(this, obj)
    _.bindAll(this)

    // store the constructor in case it needs to be cloned (by sequence)
    this.factory = factory

    // store the guid for recursion checking
    this.guid = guid

    // set up the translations, or handleParser if it is provided
    if (obj._handleParse) {
      this._handleParse = obj._handleParse.bind(this)
    } else {
      this.elements = _.transform(obj.translations, function (acc, value) {
        _.forEach(value.langs, function (lang) {
          acc[lang] = {
            describe: value.describe,
            cache: null
          }
        })
      }, {})
    }

    // set the default props
    this.props = _.defaults(props || {}, this.getDefaultProps())

    // give a _temp id if none was provided - all phrases must have an id
    if (!this.props.id) {
      this.props.id = '_temp' + nextTempId
      nextTempId++
    }

    // call onCreate
    this.onCreate()

    this._oldAdditions = []
    this._applyAdditions()

    // initialize extenders and overriders
    this._extenders = {}
    this._overriders = {}
  }

  _applyAdditions() {
    _.forEach(this._oldAdditions, (name) => {
      delete this[name]
    })

    _.forEach(this.factory.additions, (value, name) => {
      var setName = 'set' + name[0].toUpperCase() + name.slice(1)
      this[name] = value
      this[setName] = (newValue) => {
        var arg = {}
        arg[name] = newValue
        this.factory._additionsCallback(arg)
      }
    })

    this._oldAdditions = Object.keys(this.factory.additions)
    this._additionsVersion = this.factory._additionsVersion
  }

  // noop - can be overridden
  getDefaultProps() { return {} }

  // noop - can be overridden
  onCreate() { }

  // given all extensions (from the parser), make sure our cache is up-to-date
  // if it is not, update it
  _checkExtensions(extensions) {
    ;['extenders', 'overriders'].forEach((name) => {
      var cachedExtensions = Object.keys(this['_' + name])
      var currentExtensions = Object.keys(extensions[name])

      var newExtensions = _.difference(currentExtensions, cachedExtensions)
      var removedExtensions = _.difference(cachedExtensions, currentExtensions)

      newExtensions.forEach((newExtension) => {
        this['_' + name][newExtension] = extensions[name][newExtension](this.props)
      })

      removedExtensions.forEach((removedExtension) => {
        delete this['_' + name][removedExtension]
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
      var newResult = this.getValue ? this.getValue(input.clearTemps()) : input.clearTemps()
      oldResult[this.props.id] = newResult
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
        options.addLimit(phraseParseId, this.props.limit)
        dataNumber++
        return newLimit
      }

      newInput = new InputOption(preParseInputData)

      if (this.props.limit) {
        dataNumber = 0
        phraseParseId = options.generatePhraseParseId()
      }

      this._handleParse(newInput, options, applyLimit, sendData, done)
    }

    const doDescribeParse = () => {
      var lang = getBestElementLang(this.elements, options.langs)

      preParseInputData.result = {}

      // if describe has never been executed, execute it and cache it
      if (this._additionsVersion !== this.factory._additionsVersion) {
        this._applyAdditions()
        this.elements[lang].cache = null
      }
      if (!this.elements[lang].cache) {
        this.elements[lang].cache = this.elements[lang].describe.call(this)
      }

      this.elements[lang].cache.parse(new InputOption(preParseInputData), options, phraseData, phraseDone)
    }

    const parseElement = () => {
      phraseRunning = true

      // add this to the stack before doing anything
      preParseInputData = input.getData()
      preParseInputData.stack = input.stackPush({
        guid: this.guid,
        category: this.props.category
      })

      if (this._handleParse) {
        doHandleParse()
      } else {
        doDescribeParse()
      }
    }

    // if this is already on the stack, and we've made a suggestion, we need to stop
    // we don't want to cause an infinite loop
    if (
      this.guid > 3 && // do not apply this restriction to the 4 system classes
      input.suggestion.length > 0 &&
      _.find(input.stack, {guid: this.guid})
    ) {
      done()
      return
    }

    // If it is optional, a branch will skip it entirely
    if (this.props.optional) {
      data(input)
    }

    if (this._handleParse) {
      parseElement()
    } else {
      // Update the extension cache
      this._checkExtensions(options.getExtensions(this.name))

      // Check the extenders - don't call done until all are complete
      asyncEach(Object.keys(this._extenders), (extender, done) => {
        this._extenders[extender].parse(input, options, sendData, done)
      }, extendersDone)

      // Check the overriders - don't call phrase parse unless none return data
      asyncEach(Object.keys(this._overriders), (overrider, done) => {
        this._overriders[overrider].parse(input, options, overriderData, done)
      }, overridersDone)
    }
  }
}
