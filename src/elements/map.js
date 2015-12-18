import _ from 'lodash'
import { Phrase } from 'lacona-phrase'
import parse from '../parse'

export default class Map extends Phrase {
  *_handleParse (input, options) {
    if (this.props.children && this.props.children.length > 0) {
      this.childPhrase = reconcile({descriptor: this.props.children[0], phrase: this.childPhrase, options})

      for (let output of parse({phrase: this.childPhrase, input, options})) {
        const newResult = this.props.function(output.result)

        const modifications = {result: newResult}

        yield _.assign({}, output, modifications)
      }
    }
  }
}

Map.defaultProps = {
  function: _.identity
}
