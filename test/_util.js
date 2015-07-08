import _ from 'lodash'

export function text(input) {
  return _.map(input.words, 'text').join('')
}
