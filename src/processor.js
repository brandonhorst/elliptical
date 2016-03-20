import _ from 'lodash'

export default function combineProcessors (...processors) {
  return function (element) {
    return _.reduce(processors, (acc, processor) => {
      if (acc) {
        return processor(acc)
      }
    }, element)
  }
}