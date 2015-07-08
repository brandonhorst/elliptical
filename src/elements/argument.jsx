/** @jsx createElement */
import {createElement, Phrase} from 'lacona-phrase'

export default class Placeholder extends Phrase {
  describe () {
    return <descriptor {...this.props} argument={true} placeholder={true} />
  }
}
