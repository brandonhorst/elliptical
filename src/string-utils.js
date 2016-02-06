import split from 'smart-split'

export function * substrings (input, {splitOn, noSplit, reverse}) {
  if (noSplit) {
    yield input
    return
  }

  let inputs = split(input, splitOn)
  for (let i = 0; i < inputs.length; i += 2) {
    if (reverse) {
      yield inputs.slice(0, inputs.length - i).join('')
    } else {
      yield inputs.slice(0, i + 1).join('')
    }
  }
}