import _ from 'lodash'
import {limitIterator} from '../utils'

function handleAdditions (output, plural, singular, start, end) {
  const theseAdditions = output[singular] ? [output[singular]] : output[plural]
  if (theseAdditions) {
    return {
      [plural]: _.map(theseAdditions, value => ({value, start, end}))
    }
  } else {
    return {}
  }
}

function modifyOption(option, rawOutput) {
  const start = option.words.length
  const words = option.words.concat(rawOutput.words)
  const end = words.length


  return _.assign({},
    option,
    {
      result: rawOutput.result,
      text: rawOutput.remaining,
      score: rawOutput.score || 1,
      words
    },
    handleAdditions(rawOutput, 'categories', 'category', start, end),
    handleAdditions(rawOutput, 'arguments', 'argument', start, end),
    handleAdditions(rawOutput, 'annotations', 'annotation', start, end),
    handleAdditions(rawOutput, 'qualifiers', 'qualifier', start, end),
    rawOutput.data ? {data: _.concat(option.data, [rawOutput.data])} : {}
  )
}

function * optionsFromRawOutputs (option, rawOutputs) {
  for (let rawOutput of rawOutputs) {
    yield modifyOption(option, rawOutput)
  }
}

function * visit (option, {props}) {
  if (!props.func) return

  const rawOutputs = props.func(option)
  const outputs = optionsFromRawOutputs(option, rawOutputs)

  yield * limitIterator(outputs, props.limit)
}

export default {visit}
