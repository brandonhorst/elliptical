import _ from 'lodash'

export function isComplete (option) {
  return !_.some(option.words, 'placeholder')
}

// export function addWords (option, words) {
//   if (s
//   const mods = {
//     phrases: {
//       [option.phrases.length - 1]: 
//   _.last(option.phrases)
// }