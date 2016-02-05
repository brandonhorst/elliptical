import _ from 'lodash'
import { destroyPhrase } from '../component'
import { Phrase } from 'lacona-phrase'
import { reconcile } from '../reconcile'
import { parse } from '../parse'

export class Dynamic extends Phrase {
  constructor (...args) {
    super(...args)

    this._phrases = {}
    this._sources = {}
    this._lastSourceVersions = {}
  }

  static defaultProps = {
    compute () { return [] }
  }

  sourceChanged (text, options) {
    return this._sources[text] && this._lastSourceVersions[text] < options.sourceManager.getDataVersion(this._sources[text])
  }

  removeSource (text, options) {
    options.sourceManager.unsubscribe(this._sources[text])
    destroyPhrase({phrase: this._phrases[text], options})

    delete this._sources[text]
    delete this._phrases[text]
    delete this._lastSourceVersions[text]
  }

  * _handleParse (input, options) {
    let successes = 0
    const text = input.text

    if (!this._sources[text]) {
      const sourceDescriptor = this.props.observe(text)
      if (sourceDescriptor) {
        const source = options.sourceManager.subscribe(sourceDescriptor)
        options.scheduleDeactivateCallback(() => {
          this.removeSource(text, options)
        })
        this._sources[text] = source
        this._lastSourceVersions[text] = options.sourceManager.getDataVersion(source)

        const descriptor = this.props.describe(source.data)
        this._phrases[text] = reconcile({descriptor, phrase: this._phrases[text], options})
      }
    } else if (this.sourceChanged(text, options)) {
      const source = this._sources[text]
      const descriptor = this.props.describe(source.data)
      this._phrases[text] = reconcile({descriptor, phrase: this._phrases[text], options})
    }

    yield* parse({phrase: this._phrases[text], input, options})
  }
}
