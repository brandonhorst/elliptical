import _ from 'lodash'

export function isComplete (option) {
  return !_.some(option.words, 'placeholder')
}


// Accepts either an iterator of Options, or an iterator of iterators of Options
export function * limitIterator (iterator, limit) {
  if (limit) {
    let successes = 0
    for (let item of iterator) {
      let success = false

      if (item[Symbol.iterator]) {
        for (let option of item) {
          const mods = {
            callbacks: option.callbacks.concat(() => { success = true })
          }
          yield _.assign({}, option, mods)
        }
      } else {
        const mods = {
          callbacks: item.callbacks.concat(() => { success = true })
        }
        yield _.assign({}, item, mods)
      }

      if (success) successes++
      if (limit <= successes) break
    }
  } else {
    for (let item of iterator) {
      if (item[Symbol.iterator]) {
        yield * item
      } else {
        yield item
      }
    }
  }
}

// export function addWords (option, words) {
//   if (s
//   const mods = {
//     phrases: {
//       [option.phrases.length - 1]: 
//   _.last(option.phrases)
// }