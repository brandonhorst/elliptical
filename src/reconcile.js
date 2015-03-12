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

function reconcileOne({descriptor, store, options}) {
  const Constructor = getConstructor({Constructor: descriptor.Constructor})
  const props = getRealProps({descriptor, Constructor})


  if (store && store.Constructor === Constructor) {
    if (props !== store.props || store.stateChanged || Constructor.additionsChanged) {
      const describe = getDescribe({Constructor, langs: options.langs})
      const additions = Constructor.additions
      const state = store.nextState
      const newStore = _.clone(store)

      updatePhrase({phrase: store.phrase, props, additions, oldAdditions: {}, state, newStore})
      const description = getDescription({describe, props, extensions, phrase, additions})
      const describedStore = description ? reconcile({descriptor: [description], options}) : null
      newStore.describedStore = describedStore
      newStore.props = props
      newStore.stateChanged = false

      return newStore
    } else {
      return store
    }
  } else {
    const describe = getDescribe({Constructor, langs: options.langs})
    const phrase = new Constructor()
    const state = Constructor.initialState
    const newStore = {Constructor, phrase, props, nextState: state, stateChanged: false}

    const additions = Constructor.additions
    const extensions = options.getExtensions(Constructor)

    updatePhrase({phrase, props, additions, oldAdditions: {}, state, newStore})
    const description = getDescription({describe, props, extensions, phrase, additions})
    const describedStore = description ? reconcile({descriptor: [description], options}) : null

    newStore.describedStore = describedStore

    return newStore
  }
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

function updatePhrase({phrase, props, additions, oldAdditions, state, newStore}) {
  phrase.props = props

  phrase.state = state
  phrase.setState = (nextState) => {
    _.merge(newStore.nextState, nextState)
    newStore.stateChanged = true
  }

  _.forEach(phrase.oldAdditions, name => delete phrase[name])
  _.forEach(additions, (value, name) => phrase[name] = value)
}

function getDescription({describe, extensions, phrase, props}) {
  if (describe) {
    let description = describe.call(phrase)
    if (extensions.supplementers.length) {
      const supplementers = extensions.supplementers.map(Supplementer => <Supplementer {...props} />)
      description = (
        <choice>
          {supplementers}
          {description}
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
  realProps.children = _.flattenDeep(descriptor.children)
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
//
// function getTranslations(Constructor) {
//   if (Constructor.prototype.describe) {
//     return {default: Constructor.prototype.describe})
//   } else {
//     return _.transform(Constructor.translations, (acc, value) => {
//       _.forEach(value.langs, function (lang) {
//         acc[lang] = value.describe
//       })
//     }, {})
//   }
// }

//TODO this is not called
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
