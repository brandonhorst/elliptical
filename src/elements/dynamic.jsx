import _ from 'lodash'
import { destroyPhrase } from '../component'
import { parse } from '../parse'
import { Phrase } from 'lacona-phrase'
import { reconcile } from '../reconcile'
import { substrings } from '../string-utils'

export class Dynamic extends Phrase {
  constructor (...args) {
    super(...args)

    this._phrases = {}
    this._sources = {}
    this._lastSourceVersions = {}
  }

  static defaultProps = {
    splitOn: '',
    consumeAll: false
  }

  sourceChanged (text, options) {
    return this._sources[text] && this._lastSourceVersions[text] < options.sourceManager.getDataVersion(this._sources[text])
  }

  removeSource (text, options) {
    console.log(`removing for ${text}`)
    options.sourceManager.unsubscribe(this._sources[text])
    destroyPhrase({phrase: this._phrases[text], options})

    delete this._sources[text]
    delete this._phrases[text]
    delete this._lastSourceVersions[text]
  }

  * _handleParse (input, options) {
    let successes = 0

    let substringOpts = {
      splitOn: this.props.splitOn,
      noSplit: this.props.consumeAll,
      reverse: this.props.greedy
    }

    for (let substring of substrings(input.text, substringOpts)) {
      let success = false
      const substringLower = substring.toLowerCase()
      
      if (!this._sources[substringLower]) {
        const sourceDescriptor = this.props.observe(substringLower)
        if (sourceDescriptor) {
          console.log(`creating for ${substringLower}`)
          const source = options.sourceManager.subscribe(sourceDescriptor)
          options.scheduleDeactivateCallback(() => {
            this.removeSource(substringLower, options)
          })
          this._sources[substringLower] = source
          this._lastSourceVersions[substringLower] = options.sourceManager.getDataVersion(source)

          const descriptor = this.props.describe(source.data)
          this._phrases[substringLower] = reconcile({descriptor, phrase: this._phrases[substringLower], options})
        }
      } else if (this.sourceChanged(substringLower, options)) {
        const source = this._sources[substringLower]
        const descriptor = this.props.describe(source.data)
        this._phrases[substringLower] = reconcile({descriptor, phrase: this._phrases[substringLower], options})
      }

      for (let output of parse({phrase: this._phrases[substringLower], input, options})) {
        if (this.props.limit) {
          yield _.assign({}, output, {callbacks: output.callbacks.concat(() => success = true)})
        } else {
          yield output
        }
      }

      if (this.props.limit) {
        if (success) successes++
        if (this.props.limit <= successes) break
      }
    }
  }
}
