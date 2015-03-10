/** @jsx createElement */
import _ from 'lodash'
import asyncEach from 'async-each'
import * as builtins from './elements'
import {createElement} from 'lacona-phrase'
import I from 'immutable'
import Option from './input-option'
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
      throw new Error('Invalid phrase. Note: non-builtin phrases must be uppercase')
    }
  } else {
    Constructor = constructor
  }

  if (Constructor.initialAdditions) Constructor.additions = Constructor.initialAdditions
  if (!Constructor.translations) {
    if (!Constructor.prototype.describe && !Constructor.prototype._handleParse) {
      throw new Error('Phrases must either have translations on the constructor or describe on the prototype')
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
  let hasDefault = false
  if (!_.every(Constructor.translations, _.partial(_.has, _, 'describe'))) {
    throw new Error('Every translation must have a describe method')
  }
  if (!_.every(Constructor.translations, _.partial(_.has, _, 'langs'))) {
    throw new Error('Every translation must have a langs property')
  }
  if (!_.some(Constructor.translations, translation => _.indexOf(translation.langs, 'default') > -1)) {
    throw new Error('All elements must have a describe method defined for the default language')
  }
  return true
}

function clearTemps(result) {
  if (I.Map.isMap(result)) {
    return result.filter((value, key) => !_.startsWith(key, '_temp') && !_.isUndefined(value))
  } else if (_.isArray(result)) {
    return result.filter(_.isUndefined)
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

    this.translations = getElements(TrueConstructor)

    //normalize props
    let realProps = props ? _.clone(props) : {}
    realProps.children = _.flattenDeep(children)
    realProps = _.defaults(realProps, TrueConstructor.defaultProps)

    //set up state
    this.state = TrueConstructor.initialState
    this.stateChanged = false
    TrueConstructor.prototype.setState = this.setState.bind(this)

    //instantiate and validate the constructor
    this.element = new TrueConstructor(realProps)
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
    // }

    // const phraseDone = () => {
    //   phraseRunning = false
    //   checkDoneCondition()
    // }
    //
    // const extendersDone = () => {
    //   extendersRunning = false
    //   checkDoneCondition()
    // }
    //
    // const checkDoneCondition = () => {
    //   if (!extendersRunning && !phraseRunning && !overridersRunning) {
    //     done()
    //   }
    // }
    //
    // const sendData = (input) => {
    //   data(input.update('stack', stack => stack.pop()))
    // }
    //
    // const overriderData = (newOption) => {
    //   overriderGotData = true
    //   sendData(newOption)
    // }
    //
    // const overridersDone = () => {
    //   overridersRunning = false
    //   if (!overriderGotData) {
    //     parseElement()
    //   } else {
    //     checkDoneCondition()
    //   }
    // }


    // if this is already on the stack, and we've made a suggestion, we need to stop
    // we don't want to cause an infinite loop
    if (
      !_.isString(this.descriptor.Constructor) && // do not apply this restriction to system classes
      !input.get('suggestion').isEmpty() &&
      input.get('stack').find(entry => entry.get('constructor') === this.descriptor.Constructor)
    ) return []

    let outputs = []

    // If it is optional, the input is a valid output
    if (this.element.props.optional) {
      outputs.push(input)
    }

    this._checkExtensions(options.getExtensions(this.descriptor.Constructor))

    // check overriders, stop if you get any
    const overrideOutput = _.chain(this.overriders)
      .map(overrider => overrider.parse(input, options))
      .flatten()
      .value()
    if (overrideOutput.length) return outputs.concat(overrideOutput)

    //if there are no overriders, do extenders and this phrase
    const supplementOutput = _.chain(this.supplementers)
      .map(supplementer => supplementer.parse(input, options))
      .flatten()
      .value()

    const ownOutput = this.parseElement(input, options)
      .map(output => output.update('stack', stack => stack.pop()))
    return outputs.concat(supplementOutput).concat(ownOutput)
  }

  parseElement(input, options) {
    // add this to the stack before doing anything
    const inputWithStack = input.update('stack', stack => stack.push(I.Map({
      constructor: this.descriptor.Constructor,
      category: this.element.props.category
    })))

    const lang = getBestElementLang(this.translations, options.langs)
    const cache = this.translations ? this.getDescribeCache(lang) : null

    if (cache) {
      const inputWithoutResult = inputWithStack.set('result', I.Map())

      return cache
        .parse(inputWithoutResult, options)
        .map(output => {
          const newResult = this.element.getValue ?
            I.fromJS(this.element.getValue(output.get('result').toJS())) :
            output.get('result')
          const cleared = clearTemps(newResult)

          return output.set('result', input.get('result').set(this.element.props.id, cleared))
        })
    } else {
      return this.element._handleParse(inputWithStack, options, parse)
    }
  }


  // if describe has never been executed, execute it and cache it
  getDescribeCache(lang) {
    if (this.oldAdditions !== this.descriptor.Constructor.additions) {
      this.applyAdditions()
      this.translations[lang].cache = null
    }
    if (this.stateChanged) {
      this.translations[lang].cache = null
    }

    if (!this.translations[lang].cache) {
      const describe = this.translations[lang].describe
      let description
      if (describe) {
        description = describe.call(this.element)
      }
      if (description) {
        this.translations[lang].cache = new Phrase(description)
      }
    }
    return this.translations[lang].cache
  }
}

function parse(element, input, options) {
  const phrase = new Phrase(element)
  return phrase.parse(input, options)
}
