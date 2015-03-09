/** @jsx createElement */
import _ from 'lodash'
import asyncEach from 'async-each'
import * as builtins from './elements'
import {createElement} from 'lacona-phrase'
import I from 'immutable'
import Option from './input-option'
import LaconaError from './error'
import updateList from './utils/update-list'

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

  if (Constructor.initialAdditions) Constructor.additions = Constructor.initialAdditions
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

function clearTemps(result) {
  if (_.isPlainObject(result)) {
    return _.omit(result, (value, key) => {
      return _.startsWith(key, '_temp') || _.isUndefined(value)
    })
  } else if (_.isArray(result)) {
    return _.filter(result, _.isUndefined)
  } else {
    return result
  }
}

export default class Phrase {
  constructor(options) {
    // store the constructor in case it needs to be cloned (by sequence)
    this.descriptor = options

    const {Constructor, props, children} = options

    // get the actual constructor, as constructor could be a string
    const TrueConstructor = getConstructor(Constructor)
    validate(TrueConstructor)

    // get the translations, or handleParse if it is provided
    if (!TrueConstructor.prototype._handleParse) {
      this.translations = getElements(TrueConstructor)
    }

    //normalize props
    let realProps = props ? _.clone(props) : {}
    realProps.children = _.flattenDeep(children)
    realProps = _.defaults(realProps, TrueConstructor.defaultProps)

    //set up state
    this.state = TrueConstructor.initialState
    this.stateChanged = false
    TrueConstructor.prototype.setState = this.setState.bind(this)

    //instantiate and validate the constructor
    if (TrueConstructor.prototype._handleParse) {
      this.element = new TrueConstructor(realProps, Phrase)
    } else {
      this.element = new TrueConstructor(realProps)
    }
    this.element.props = realProps
    this.element.state = this.state

    this.oldAdditions = {}

    // initialize extenders and overriders
    this.supplementers = []
    this.overriders = []
  }

  setState(nextState) {
    this.stateChanged = true
    this.state = nextState

    //if this.setState is called in the Constructor, this.element will not exist yet
    if (this.element) this.element.state = nextState
  }

  applyAdditions() {
    _.forEach(this.oldAdditions, (value, name) => {
      delete this.element[name]
    })

    _.forEach(this.descriptor.Constructor.additions, (value, name) => {
      this.element[name] = value
      this.element[`set${_.capitalize(name)}`] = (newValue) => {
        var arg = {[name]: newValue}
        if (this.descriptor.Constructor.additionsCallback) {
          this.descriptor.Constructor.additionsCallback(arg)
        }
      }
    })

    this.oldAdditions = this.descriptor.Constructor.additions
  }

  // given all extensions (from the parser), make sure our cache is up-to-date
  // if it is not, update it
  _checkExtensions(extensions) {
    _.forEach(['supplementers', 'overriders'], kind => {
      this[kind] = updateList(
        extensions[kind],
        this[kind],
        instance => instance.descriptor.Constructor,
        Constructor => new Phrase(<Constructor {...this.element.props} />)
      )
    })
  }

  parse(input, options, data, done) {
    var preParseInputData
    var oldResultStored = input.get('result')
    var phraseRunning = false
    var extendersRunning = true
    var overridersRunning = true
    var overriderGotData = false

    const phraseData = (input) => {
      const newResult = clearTemps(this.element.getValue ?
        I.fromJS(this.element.getValue(input.get('result').toJS())) :
        input.get('result'))

      let newOption = input.set('result', oldResultStored.set(this.element.props.id, newResult))

      sendData(newOption)

      // oldResultStored.set(this.element.props.id, )
      // var newInputData = input.getData()
      // var oldResult = _.clone(oldResultStored)
      //
      // let newResult = _.clone(input.result)
      // if (this.element.getValue) newResult = this.element.getValue.call(this.element, newResult)
      // newResult = clearTemps(newResult)
      //
      // oldResult[this.element.props.id] = newResult
      // newInputData.result = oldResult
      //
      // return sendData(new InputOption(newInputData))
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
      data(input.update('stack', stack => stack.pop()))
      //
      // var newInput = input.getData()
      // newInput.stack = input.stackPop()
      // data(new InputOption(newInput))
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
        dataNumber++
        return input.update('limit', limit => limit.set(phraseParseId, dataNumber))
      }

      newInput = preParseInputData

      if (this.element.props.limit) {
        dataNumber = 0
        phraseParseId = options.generatePhraseParseId()
      }

      this.element._handleParse(newInput, options, applyLimit, sendData, done)
    }

    const doDescribeParse = () => {
      var lang = getBestElementLang(this.translations, options.langs)

      const preDescribeInput = preParseInputData.set('result', I.Map())

      // if describe has never been executed, execute it and cache it
      if (this.oldAdditions !== this.descriptor.Constructor.additions) {
        this.applyAdditions()
        this.translations[lang].cache = null
      }
      if (this.stateChanged) {
        this.translations[lang].cache = null
      }
      if (!this.translations[lang].cache) {
        this.translations[lang].cache = new Phrase(this.translations[lang].describe.call(this.element))
      }

      this.translations[lang].cache.parse(preDescribeInput, options, phraseData, phraseDone)
    }

    const parseElement = () => {
      phraseRunning = true

      // add this to the stack before doing anything
      preParseInputData = input.update('stack', stack => stack.push(I.Map({
        constructor: this.descriptor.Constructor,
        category: this.element.props.category
      })))

      if (this.element._handleParse) {
        doHandleParse()
      } else {
        doDescribeParse()
      }
    }

    // if this is already on the stack, and we've made a suggestion, we need to stop
    // we don't want to cause an infinite loop
    if (
      !_.isString(this.descriptor.Constructor) && // do not apply this restriction to system classes
      input.get('suggestion').count() > 0 &&
      // TODO: This is TERRIBLY ineffecient use of lodash/immutable
      _.find(input.get('stack').toJS(), {constructor: this.descriptor.Constructor})
    ) return done()

    // If it is optional, a branch will skip it entirely
    if (this.element.props.optional) {
      data(input)
    }

    if (this.element._handleParse) {
      parseElement()
    } else {
      // Update the extension cache
      this._checkExtensions(options.getExtensions(this.descriptor.Constructor))

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
