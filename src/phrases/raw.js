import _ from 'lodash'
import {limitIterator} from '../utils'

function modifyOption(option, rawOutput, category, annotation) {
  const words = option.words.concat(
    _.map(rawOutput.words, (word) => _.assign({},
      word,
      option.currentArgument ? {argument: option.currentArgument} : {}, //DEPRECATED
      category ? {category} : {}
    ))
  )

  const modification = {
    result: rawOutput.result,
    text: rawOutput.remaining,
    score: rawOutput.score || 1,
    qualifiers: rawOutput.qualifiers || [],
    words
  }

  return _.assign({}, option, modification)
}

function * optionsFromRawOutputs (option, rawOutputs, category, annotation) {
  for (let rawOutput of rawOutputs) {
    yield modifyOption(option, rawOutput, category)
  }
}

function * visit (option, {props}) {
  if (!props.func) return

  const rawOutputs = props.func(option.text)
  const outputs = optionsFromRawOutputs(option, rawOutputs, props.category, props.annotation)

  yield * limitIterator(outputs, props.limit)
}

export default {visit}
