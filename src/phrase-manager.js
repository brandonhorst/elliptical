import _ from 'lodash'
import Phrase from './phrase'

export default class PhraseManager {
  constructor() {
    this._sentences = []
    this._sentenceMap = new WeakMap()
    // this._supplementers = new WeakMap()
    // this._overriders = new WeakMap()
  }

  update(sentences, extensions) {
    this._sentences = sentences
    _.forEach(sentences, sentence => {
      if (!this._sentenceMap.has(sentence)) {
        this._sentenceMap.set(sentence, new Phrase(sentence))
      }
    })
  }

  get sentences() {
    return _.map(this._sentences, _.ary(this._sentenceMap.get, 1), this._sentenceMap)
  }
}
