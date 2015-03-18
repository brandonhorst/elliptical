/** @jsx createElement */
import _ from 'lodash'
import * as builtins from './elements'
import {createElement} from 'lacona-phrase'

export default function reconcile({descriptor, store, options}) {
  const func = _.isArray(descriptor) ? reconcileArray : reconcileOne
  return func({descriptor, store, options})
}

function reconcileArray({descriptor, store, options}) {
  return _.chain(descriptor)
    .zip(store)
    .map(x => reconcile({descriptor: x[0], store: x[1], options}))
    .flatten()
    .value()
}

function reconcileOne({descriptor, store, options, index}) {
  const Constructor = getConstructor({Constructor: descriptor.Constructor})
  const props = getRealProps({descriptor, Constructor, index})
  const extensions = options.getExtensions(Constructor)
  const prototypeObj = _.clone(Constructor.prototype)

  if (store && store.Constructor === Constructor) {
    if (store.phrase._stateChanged || !_.isEqual(props, store.props) ||
        !_.isEqual(extensions, store.oldExtensions) ||
        !_.isEqual(prototypeObj, store.oldPrototype)) {
      const phrase = store.phrase

      const oldPrototype = _.clone(Constructor.prototype)

      const {observers, describedStore} = doLifeCycle({Constructor, phrase,
        props, extensions, options, oldStore: store.describedStore})

      return _.assign({}, store, {props, oldExtensions: extensions,
        oldPrototype: prototypeObj, describedStore})
    } else {
      return store
    }
  } else {
    const phrase = createPhrase({Constructor})
    const state = Constructor.initialState

    const {describedStore} = doLifeCycle({Constructor, phrase, props,
      state, extensions, options})

    return {Constructor, phrase, props, oldExtensions: extensions,
      oldPrototype: prototypeObj, describedStore}
  }
}

function createPhrase({Constructor}) {
  const phrase = new Constructor()

  return phrase
}

function doLifeCycle({Constructor, phrase, props, state, extensions, options, oldStore, changed}) {
  setPropsAndstate({phrase: phrase, props, state, changed: options.triggerReparse})
  const describe = getDescribe({Constructor, langs: options.langs})
  const description = getDescription({describe, props, extensions, phrase})
  const describedStore = description ?
    reconcile({descriptor: description, options, store: oldStore}) :
    null

  return {describedStore}
}

function getDescribe({Constructor, langs}) {
  if (Constructor.prototype.describe) {
    return Constructor.prototype.describe
  } else if (Constructor.translations) {
    return _.chain(langs.concat('default'))
      .map(lang => _.find(Constructor.translations, translations => {return _.includes(translations.langs, lang)}))
      .filter(_.negate(_.isUndefined))
      .map(_.property('describe'))
      .first()
      .value()
  }
}

function setPropsAndstate({phrase, props, state, changed}) {
  phrase.props = props

  if (!phrase.setState) {
    phrase.state = state || {}
    phrase.setState = function (nextState) {
      _.merge(this.state, nextState)
      this._stateChanged = true
      changed(this)
    }
  }
}

function getDescription({describe, extensions, phrase, props}) {
  if (describe) {
    let description = describe.call(phrase)
    if (extensions.supplementers.length) {
      const supplementers = extensions.supplementers.map(Supplementer => <Supplementer {...props} />)
      description = (
        <choice>
          {description}
          {supplementers}
        </choice>
      )
    }

    if (extensions.overriders.length) {
      const overriders = extensions.overriders.map(Overrider => <Overrider {...props} />)
      description = (
        <choice limit={1}>
          <choice>
            {overriders}
          </choice>
          {description}
        </choice>
      )
    }
    return description
  }
}

function getRealProps({descriptor, Constructor}) {
  const realProps = _.defaults(descriptor.props || {}, Constructor.defaultProps || {})
  if (descriptor.children && descriptor.children.length > 0) {
    realProps.children = _.flattenDeep(descriptor.children)
  }
  return realProps
}

function getConstructor({Constructor}) {
  if (_.isString(Constructor)) {
    if (_.has(builtins, Constructor)) {
      return builtins[Constructor]
    } else {
      throw new Error('Invalid phrase. Note: non-builtin phrases must be uppercase')
    }
  }
  return Constructor
}

//TODO debug validation would be nice
// function validate(Constructor) {
//   let hasDefault = false
//   if (!_.every(Constructor.translations, _.partial(_.has, _, 'describe'))) {
//     throw new Error('Every translation must have a describe method')
//   }
//   if (!_.every(Constructor.translations, _.partial(_.has, _, 'langs'))) {
//     throw new Error('Every translation must have a langs property')
//   }
//   if (!_.some(Constructor.translations, translation => _.indexOf(translation.langs, 'default') > -1)) {
//     throw new Error('All elements must have a describe method defined for the default language')
//   }
//   return true
// }
