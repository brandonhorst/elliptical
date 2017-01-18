import _ from 'lodash'

export default function createOption (mods) {
  return _.defaults({}, mods, {
    text: '',
    words: [],
    qualifiers: [],
    annotations: [],
    categories: [],
    arguments: [],
    score: 1,
    callbacks: [],
    data: []
  })
}
