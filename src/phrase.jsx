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
      acc[lang] = value.describe
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

function getRealProps(props, children, defaultProps) {
  const realProps = props ? _.clone(props) : {}
  realProps.children = _.flattenDeep(children)
  return _.defaults(realProps, defaultProps)
}

export default class Phrase {
  constructor(options) {
    this.descriptor = options

    const {Constructor, props, children} = options

    // get the actual constructor, as constructor could be a string
    const TrueConstructor = getConstructor(Constructor)
    validate(TrueConstructor)

    this.translations = getElements(TrueConstructor)

    //normalize props
    this.props = getRealProps(props, children, TrueConstructor.defaultProps)

    //set up state
    this.state = TrueConstructor.initialState
    TrueConstructor.prototype.setState = this.setState.bind(this)

    this.element = new TrueConstructor()

    this.oldAdditions = []

    this.supplementers = []
    this.overriders = []
  }

  setState(nextState) {
    this.state = nextState
    this.stateChanged = true
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

  *parse(input, options, data, done) {
    // if this is already on the stack, and we've made a suggestion, we need to stop
    // we don't want to cause an infinite loop
    if (!_.isString(this.descriptor.Constructor) && !input.get('suggestion').isEmpty() &&
        input.get('stack').find(entry => entry.get('constructor') === this.descriptor.Constructor)) {
      return
    }

    // If it is optional, the input is a valid output
    if (this.props.optional) {
      yield input
    }

    // this._checkExtensions(options.getExtensions(this.descriptor.Constructor))
    //
    // // check overriders, stop if you get any
    // const overrideOutput = _.chain(this.overriders)
    //   .map(overrider => overrider.parse(input, options))
    //   .flatten()
    //   .value()
    // if (overrideOutput.length) return outputs.concat(overrideOutput)
    //
    // //if there are no overriders, do extenders and this phrase
    // const supplementOutput = _.chain(this.supplementers)
    //   .map(supplementer => supplementer.parse(input, options))
    //   .flatten()
    //   .value()
    //
    // const ownOutput = this.parseElement(input, options)
    //   .map(output => output.update('stack', stack => stack.pop()))
    // return outputs.concat(supplementOutput).concat(ownOutput)
    const iterator = this.parseElement(input, options)
    for (let output of iterator) {
      yield output.update('stack', stack => stack.pop())
    }
  }

  *parseElement(input, options) {
    // add this to the stack before doing anything
    const inputWithStack = input.update('stack', stack => stack.push(I.Map({
      constructor: this.descriptor.Constructor,
      category: this.props.category
    })))

    const lang = getBestElementLang(this.translations, options.langs)
    this.element.props = this.props
    this.checkForUpdate(lang)

    if (this.describedElement) {
      const inputWithoutResult = inputWithStack.set('result', I.Map())

      const iterator = this.describedElement.parse(inputWithoutResult, options)
      for (let output of iterator) {
        if (output) {
          const newResult = this.element.getValue ?
            I.fromJS(this.element.getValue(output.get('result').toJS())) :
            output.get('result')
          const cleared = clearTemps(newResult)

          yield output.set('result', input.get('result').set(this.props.id, cleared))
        }
      }
    } else {
      yield* this.element._handleParse(inputWithStack, options, parse)
    }
  }


  // if describe has never been executed, execute it and cache it
  checkForUpdate(lang) {
    const describe = this.translations[lang]
    if (describe) {
      if (this.description == null || this.stateChanged ||
          lang !== this.oldLang || this.descriptor.Constructor.additionsChanged ||
          !_.isEqual(this.oldProps, this.props)) {
        this.element.state = this.state
        _.forEach(this.oldAdditions, name => delete this.element[name])
        _.forEach(this.descriptor.Constructor.additions, (value, name) => this.element[name] = value)

        this.oldLang = lang
        this.oldProps = this.props
        this.oldAdditions = Object.keys(this.descriptor.Constructor.additions || {})
        if (_.isFunction(this.descriptor.Constructor)) this.descriptor.Constructor.additionsChanged = false
        this.stateChanged = false

        let description = describe.call(this.element)
        if (description) {
          if (this.description && description.Constructor === this.description.Constructor) {
            this.describedElement.props = getRealProps(description.props, description.children, this.description.Constructor.defaultProps)
          } else {
            this.describedElement = new Phrase(description)
          }
          this.description = description
        }
      }
    }
  }
}

function *parse(element, input, options) {
  const phrase = new Phrase(element)
  yield* phrase.parse(input, options)
}
