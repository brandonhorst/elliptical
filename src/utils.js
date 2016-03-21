import _ from 'lodash'
import split from 'smart-split'

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

export function * substrings (
  input,
  {splitOn = '', consumeAll = false, greedy = false}
) {
  if (consumeAll) {
    yield input
    return
  }

  let inputs = split(input, splitOn)
  for (let i = 0; i < inputs.length; i += 2) {
    if (greedy) {
      yield inputs.slice(0, inputs.length - i).join('')
    } else {
      yield inputs.slice(0, i + 1).join('')
    }
  }
}
