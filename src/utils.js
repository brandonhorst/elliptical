import _ from 'lodash'

export function isComplete (option) {
  return !_.some(option.words, 'placeholder')
}
