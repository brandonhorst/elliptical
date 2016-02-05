import _ from 'lodash'
import { Phrase } from 'lacona-phrase'
import { reconcile } from '../reconcile'
import { parse } from '../parse'

function hasPlaceholder(output) {
  return _.any(output.words, 'placeholder')
}

export class MapPhrase extends Phrase {
  * _handleParse (input, options) {
    if (this.props.children && this.props.children.length > 0) {
      this.childPhrase = reconcile({descriptor: this.props.children[0], phrase: this.childPhrase, options})

      for (let output of parse({phrase: this.childPhrase, input, options})) {
        if (hasPlaceholder(output)) {
          yield output
        } else {
          if (this.props.function) {
            const newResult = this.props.function(output.result)
            const modifications = {result: newResult}
            yield _.assign({}, output, modifications)
          } else if (this.props.iteratorFunction) {
            let successes = 0

            const newIterator = this.props.iteratorFunction(output.result)
            for (let newResult of newIterator) {
              let success = false

              const modifications = {result: newResult}
              if (this.props.limit) {
                modifications.callbacks = output.callbacks.concat(() => success = true)
              }

              yield _.assign({}, output, modifications)

              if (this.props.limit) {
                if (success) successes++
                if (this.props.limit <= successes) break
              }
            }
          }
        }
      }
    }
  }

  _destroy (destroy) {
    destroy(this.childPhrase)

    delete this.childPhrase
  }

}
