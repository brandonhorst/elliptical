import _ from 'lodash'

function * traverse (option, {
  props: {category, func = () => [], limit}
}) {
  let successes = 0

  for (let output of func(option.text)) {
    let success = false

    const modification = {
      result: output.result,
      text: output.remaining,
      score: output.score || 1,
      qualifiers: output.qualifiers || [],
      words: option.words.concat(
        _.map(output.words, (word) => _.assign({},
          word,
          option.currentArgument ? {argument: option.currentArgument} : {},
          category ? {category} : {}
        ))
      )
    }

    if (limit) modification.callbacks = option.callbacks.concat(() => { success = true })
    if (output.ellipsis) modification.ellipsis = true

    yield _.assign({}, option, modification)

    if (limit) {
      if (success) successes++
      if (limit <= successes) break
    }
  }
}

export default {traverse}
