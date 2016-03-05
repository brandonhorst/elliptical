// import _ from 'lodash'
// import { Phrase, Source } from 'lacona-phrase'

// import * as builtinPhrases from './elements'
// import * as builtinSources from './sources'
// import { LaconaError } from './error'

// export function getConstructor ({Constructor, type}) {
//   if (_.isString(Constructor)) {
//     const builtins = getBuiltinsForType(type)

//     if (_.has(builtins, Constructor)) {
//       return builtins[Constructor]
//     } else {
//       throw new LaconaError(`${Constructor} is an invalid phrase. Note: non-builtin phrases must be uppercase`)
//     }
//   } else {
//     assertValid({Constructor, type})
//   }
//   return Constructor
// }

// export function addSource ({component, options}) {
//   if (component.observe) {
//     const sourceDescriptor = component.observe()
//     if (sourceDescriptor) {
//       const source = options.sourceManager.subscribe(sourceDescriptor)
//       component.__lastSourceVersion = 0

//       component.source = source
//     }
//   }
// }

// export function removeSource ({component, options}) {
//   if (component.source) {
//     options.sourceManager.unsubscribe(component.source)
//     delete component.source
//   }
// }

// function subclassOf (Constructor, DesiredSuperclass) {
//   return Constructor.prototype instanceof DesiredSuperclass
// }

// function assertValid ({Constructor, type}) {
//   if (!_.isFunction(Constructor)) {
//     throw new LaconaError(`Constructor ${Constructor} is not a valid ${type}`)
//   }

//   if (type === 'phrase') {
//     if (Constructor.prototype.describe) {

//     } else if (Constructor.translations) {
//       if (!_.every(Constructor.translations, _.partial(_.has, _, 'describe'))) {
//         throw new LaconaError('Every translation must have a describe method')
//       }
//       if (!_.every(Constructor.translations, _.partial(_.has, _, 'langs'))) {
//         throw new LaconaError('Every translation must have a langs property')
//       }
//       if (!_.some(Constructor.translations, translation => _.indexOf(translation.langs, 'default') > -1)) {
//         throw new LaconaError('All elements must have a describe method defined for the default language')
//       }
//     }
//   }
// }

// function getBuiltinsForType (type) {
//   if (type === 'phrase') {
//     return builtinPhrases
//   } else if (type === 'source') {
//     return builtinSources
//   } else {
//     throw new LaconaError(`${type} is an invalid constructor type.`)
//   }
// }

// export function getRealProps ({descriptor, Constructor}) {
//   const realProps = _.defaults(descriptor.props || {}, Constructor.defaultProps || {})
//   if (descriptor.children && descriptor.children.length > 0) {
//     realProps.children = _.flattenDeep(descriptor.children)
//   }
//   return realProps
// }

// export function instantiate ({Constructor, props}) {
//   return new Constructor({props})
// }

// export function destroyPhrase ({phrase, options}) {
//   if (phrase) {
//     if (phrase._handleParse) {
//       function destroyCall (phrase) {
//         destroyPhrase({phrase, options})
//       }

//       phrase._destroy(destroyCall)
//     }

//     removeSource({component: phrase, options})
//   }
// }