/** @jsx createElement */
import _ from 'lodash'
import * as builtins from './elements'
import { createElement } from 'lacona-phrase'
import { getRealProps, getConstructor, instantiate, addSource, removeSource, destroyPhrase } from './component'

export function reconcile ({descriptor, phrase, options}) {
  const func = _.isArray(descriptor) ? reconcileArray : reconcileOne
  return func({descriptor, phrase, options})
}

function reconcileArray ({descriptor, phrase, options}) {
  return _.chain(descriptor)
    .reject(item => item == null)
    .reject(_.isString)
    .zip(phrase)
    .map(([descriptor, phrase]) => reconcile({descriptor, phrase, options}))
    .value()
}

function reconcileOne ({descriptor, phrase, options}) {
  if (descriptor == null && phrase) return destroyPhrase({phrase, sourceManager: options.sourceManager})

  const Constructor = getConstructor({Constructor: descriptor.Constructor, type: 'phrase'})
  const props = getRealProps({descriptor, Constructor})

  if (phrase && phrase.constructor === Constructor && _.isEqual(props, phrase.props)) { // TODO could be sped up if we don't compare props for things without a describe
    const {extensionsChanged, extensions} = getExtensions({Constructor, phrase, options})

    if (extensionsChanged || sourceChanged({phrase, options})) {
      const describedPhrase = addDescribedPhrase({Constructor, phrase, extensions, options})
    }

    return phrase
  } else { //reconstruct
    const extensions = options.getExtensions(Constructor)

    if (phrase) destroyPhrase({phrase, options})

    const newPhrase = instantiate({Constructor, props})

    addSource({component: newPhrase, options})

    const describedPhrase = addDescribedPhrase({Constructor, phrase: newPhrase, extensions, options})

    newPhrase.__oldExtensions = extensions

    return newPhrase
  }
}

function sourceChanged ({phrase, options}) {
  return phrase.source && phrase.__lastSourceVersion < options.sourceManager.getDataVersion(phrase.source)
}

function getExtensions ({Constructor, phrase, options}) {
  if (options.extensionsChanged) {
    const extensions = options.getExtensions(Constructor)

    if (!_.isEqual(extensions, phrase.__oldExtensions)) {
      phrase.__oldExtensions = extensions
      return {
        extensions,
        extensionsChanged: true
      }
    }
  }

  return {
    extensionsChanged: false,
    extensions: phrase.__oldExtensions
  }
}

function addDescribedPhrase ({phrase, extensions, options}) {
  const describe = getCall({prop: 'describe', Constructor: phrase.constructor, langs: options.langs})
  const description = getDescription({describe, extensions, phrase})
  const describedPhrase = description
    ? reconcile({descriptor: description, options, phrase: phrase.__describedPhrase})
    : null
  phrase.__describedPhrase = describedPhrase
}

function getCall ({Constructor, langs, prop}) {
  if (Constructor.prototype[prop]) {
    return Constructor.prototype[prop]
  } else if (Constructor.translations) {
    return getCallFromTranslations({prop, langs, translations: Constructor.translations})
  }
}

function getCallFromTranslations ({prop, langs, translations}) {
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

function getDescription ({describe, extensions, phrase}) {
  if (describe) {
    const tempDescription = describe.call(phrase)
    if (extensions.length) {
      const extensionElements = _.map(extensions, Extension => <Extension {...phrase.props} id={undefined} />)

      return (
        <choice>
          {tempDescription}
          {extensionElements}
        </choice>
      )
    } else {
      return tempDescription
    }
  }
}

