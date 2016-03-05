import _ from 'lodash'
import reconcile from '../reconcile'
import { substrings } from '../string-utils'

export default {
  * parse (option, {props, register}) {
    let successes = 0

    let substringOpts = {
      splitOn: props.splitOn,
      noSplit: props.consumeAll,
      reverse: props.greedy
    }

    const iterations = option.text == null ? ['\uFFFD'] : substrings(option.text, substringOpts)

    for (let substring of iterations) {
      let success = false
      
      const observation = props.observe
        ? props.observe(
          substring === '\uFFFD' ? undefined : substring,
          {props: {}, children: []}
        ) : undefined

      const currentValue = observation ? register(observation, reconcile) : undefined

      const description = props.describe
        ? props.describe(
          {props: {}, children: [], data: currentValue}
        ) : undefined
      if (!description) continue

      const traverse = reconcile(description)

      const results = traverse(option)

      if (props.limit) {
        for (let output of results) {
          yield _.assign({}, output, {
            callbacks: output.callbacks.concat(() => success = true)
          })
        }

        if (success) successes++
        if (props.limit <= successes) break
      } else {
        yield* results
      }
    } 
  }
}



// import _ from 'lodash'
// import { destroyPhrase } from '../component'
// import { parse } from '../parse'
// import { Phrase } from 'lacona-phrase'
// import { reconcile } from '../reconcile'
// import { substrings } from '../string-utils'

// export class Dynamic extends Phrase {
//   constructor (...args) {
//     super(...args)

//     this._phrases = {}
//     this._sources = {}
//     this._lastSourceVersions = {}
//   }

//   static defaultProps = {
//     splitOn: '',
//     consumeAll: false
//   }

//   sourceChanged (text, options) {
//     return this._sources[text] && this._lastSourceVersions[text] < options.sourceManager.getDataVersion(this._sources[text])
//   }

//   removeSource (text, options) {
//     options.sourceManager.unsubscribe(this._sources[text])
//     destroyPhrase({phrase: this._phrases[text], options})

//     delete this._sources[text]
//     delete this._phrases[text]
//     delete this._lastSourceVersions[text]
//   }

//   * _handleParse (input, options) {
//     let successes = 0

//     let substringOpts = {
//       splitOn: this.props.splitOn,
//       noSplit: this.props.consumeAll,
//       reverse: this.props.greedy
//     }

//     const iterations = input.text == null ? ['\uFFFD'] : substrings(input.text, substringOpts)

//     for (let substring of iterations) {
//       let success = false
      
//       if (!this._sources[substring]) {
//         const sourceDescriptor = this.props.observe(substring === '\uFFFD' ? undefined : substring)
//         if (sourceDescriptor) {
//           const source = options.sourceManager.subscribe(sourceDescriptor)
//           options.scheduleDeactivateCallback(() => {
//             this.removeSource(substring, options)
//           })
//           this._sources[substring] = source
//           this._lastSourceVersions[substring] = options.sourceManager.getDataVersion(source)
//         }
//       }

//       const descriptor = this.props.describe(this._sources[substring] ? this._sources[substring].data : undefined)
//       this._phrases[substring] = reconcile({descriptor, phrase: this._phrases[substring], options})

//       if (this._phrases[substring]) {
//         for (let output of parse({phrase: this._phrases[substring], input, options})) {
//           if (this.props.limit) {
//             yield _.assign({}, output, {callbacks: output.callbacks.concat(() => success = true)})
//           } else {
//             yield output
//           }
//         }

//         if (this.props.limit) {
//           if (success) successes++
//           if (this.props.limit <= successes) break
//         }
//       }
//     }
//   }
// }
