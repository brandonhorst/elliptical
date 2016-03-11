import _ from 'lodash'
import {limitIterator} from '../utils'

function modifyOption(option, rawOutput, category) {
  const modification = {
    result: rawOutput.result,
    text: rawOutput.remaining,
    score: rawOutput.score || 1,
    qualifiers: rawOutput.qualifiers || [],
    words: option.words.concat(
      _.map(rawOutput.words, (word) => _.assign({},
        word,
        option.currentArgument ? {argument: option.currentArgument} : {},
        category ? {category} : {}
      ))
    )
  }

  return _.assign({}, option, modification)
}

function * optionsFromRawOutputs (option, rawOutputs, category) {
  for (let rawOutput of rawOutputs) {
    yield modifyOption(option, rawOutput, category)
  }
}

function * traverse (option, {props}) {
  if (!props.func) return

  const rawOutputs = props.func(option.text)
  const outputs = optionsFromRawOutputs(option, rawOutputs, props.category)

  yield * limitIterator(outputs, props.limit)
}

export default {traverse}
