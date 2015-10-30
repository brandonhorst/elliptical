/** @jsx createElement */
import _ from 'lodash'
import * as builtins from './elements'
import {createElement} from 'lacona-phrase'

export function reconcile({descriptor, phrase, options}) {
  const func = _.isArray(descriptor) ? reconcileArray : reconcileOne
  return func({descriptor, phrase, options})
}

function reconcileArray({descriptor, phrase, options}) {
  return _.chain(descriptor)
    .reject(_.isNull)
    .reject(_.isString)
    .zip(phrase)
    .map(([descriptor, phrase]) => reconcile({descriptor, phrase, options}))
    .value()
}

function reconcileOne({descriptor, phrase, options}) {
  if (descriptor == null && phrase) return destroy({phrase, sourceManager: options.sourceManager})

  const Constructor = getConstructor({Constructor: descriptor.Constructor})
  const props = getRealProps({descriptor, Constructor})
  const extensions = options.getExtensions(Constructor)

  if (phrase && phrase.constructor === Constructor && _.isEqual(props, phrase.props)) {
    if (options.sourceManager.sourceChanged(phrase) ||
        !_.isEqual(extensions, phrase.__oldExtensions)) {
      const describedPhrase = getDescribedPhrase({Constructor, phrase, extensions, options})

      phrase.__oldExtensions = extensions
      phrase.__describedPhrase = describedPhrase

      return phrase

    } else {
      return phrase
    }
  } else {
    if (phrase) destroy({phrase, sourceManager: options.sourceManager})

    const newPhrase = new Constructor()
    newPhrase.props = props

    options.sourceManager.sourceInstance(newPhrase)

    create({phrase: newPhrase})

    const describedPhrase = getDescribedPhrase({Constructor, phrase: newPhrase, extensions, options})

    newPhrase.__oldExtensions = extensions
    newPhrase.__describedPhrase = describedPhrase

    return newPhrase
  }
}

function getDescribedPhrase({phrase, extensions, options}) {
  const describe = getCall({prop: 'describe', Constructor: phrase.constructor, langs: options.langs})
  const description = getDescription({describe, extensions, phrase})
  return description ?
    reconcile({descriptor: description, options, phrase: phrase.__describedPhrase}) :
    null
}

function getCall({Constructor, langs, prop}) {
  if (Constructor.prototype[prop]) {
    return Constructor.prototype[prop]
  } else if (Constructor.translations) {
    return getCallFromTranslations({prop, langs, translations: Constructor.translations})
  }
}

function getCallFromTranslations({prop, langs, translations}) {
  return _.chain(langs.concat('default'))
    .map(lang => _.find(translations, obj => _.includes(obj.langs, lang)))
    .filter(_.negate(_.isUndefined))
    .first()
    .value()[prop]
}
//
// function setPropsAndState({phrase, props, state, changed}) {
//   phrase.props = props
//
//   if (!phrase.setState) {
//     phrase.state = state || {}
//     phrase.setState = function (nextState) {
//       _.merge(this.state, nextState)
//       this._stateChanged = true
//       changed(this)
//     }
//   }
// }

function getDescription({describe, extensions, phrase}) {
  if (describe) {
    const tempDescription = describe.call(phrase)
    if (extensions.length) {

      if (tempDescription) {
        const modifiedDescription = _.merge({}, tempDescription, {props: {id: 0}})
        const extensionElements = _.map(extensions, (Extension, index) => <Extension {...phrase.props} id={index + 1} />)

        return (
          <choice>
            {modifiedDescription}
            {extensionElements}
          </choice>
        )
      } else {
        const extensionElements = _.map(extensions, (Extension, index) => <Extension {...phrase.props} id={index} />)

        return <choice>{extensionElements}</choice>
      }
    } else {
      return tempDescription
    }
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
      throw new Error(`${Constructor} is an invalid phrase. Note: non-builtin phrases must be uppercase`)
    }
  }
  return Constructor
}

export function destroy({phrase, sourceManager}) {
  if ((phrase.constructor === builtins.choice || phrase.constructor === builtins.sequence) && phrase.childPhrases) {
    phrase.childPhrases.forEach(phrase => destroy({phrase, sourceManager}))
  }

  sourceManager.unsourceInstance(phrase)

  if (phrase.destroy) phrase.destroy()
}

function create({phrase}) {
  if (phrase.create) phrase.create()
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
