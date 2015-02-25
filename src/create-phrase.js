import Phrase from './phrase'
import LaconaError from './error'
import _ from 'lodash'

var nextGUID = 0

function createPhraseFactory (obj) {
  var thisId = nextGUID

  function phraseFactory (props) {
    var phrase = new Phrase(obj, props, phraseFactory, thisId)

    return phrase
  }

  phraseFactory._additionsVersion = 0
  phraseFactory.additions = {}

  phraseFactory.setAdditions = function (additions, callback) {
    this.additions = additions
    this._additionsVersion++
    this._additionsCallback = callback
  }

  nextGUID++

  // set some properties on the factory, so they can be used for
  // extension and precidence
  phraseFactory.extends = obj.extends || []
  phraseFactory.overrides = obj.overrides || []
  phraseFactory.elementName = obj.name
  phraseFactory.additions = {}

  return phraseFactory
}

export default function createPhrase (obj) {

}
