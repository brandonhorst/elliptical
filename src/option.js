import _ from 'lodash'

export default function createOption (mods) {
  return _.defaults({}, mods, {
    text: '',
    words: [],
    qualifiers: [],
    score: 1
  })
}
