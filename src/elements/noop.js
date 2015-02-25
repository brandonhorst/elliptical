import {Phrase} from 'lacona-phrase'

export default class Noop extends Phrase {
  describe() {
    console.log('Noop#describe should never be called')
  }
}
