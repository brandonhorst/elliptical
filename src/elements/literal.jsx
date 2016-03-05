import _ from 'lodash'
import {match} from '../string-match'
import element from '../element'

function compute (input, text, fuzzy) {
  if (text == null) return []

  return match({input, text, fuzzy})
}

function decorateFunc (input, text) {
  if (input == null || input === '') {
    return []
  } else {
    return [{
      words: [{text, input: false}],
      remaining: input,
      score: 1
    }]
  }
}

function describe ({props: {
  text = '',
  decorate = false,
  allowInput = true,
  fuzzy = false,
  category
}}) {
  if (decorate) {
    if (allowInput) {
      return (
        <choice>
          <literal text={text} fuzzy={fuzzy} />
          <raw func={input => decorateFunc(input, text)} />
        </choice>
      )
    } else {
      return <raw func={input => decorateFunc(input, text)} />
    }
  } else {
    return <raw
      func={input => compute(input, text, fuzzy)}
      category={category} />
  }
}

export default {
  describe
}


// export class Literal extends Phrase {
//   static defaultProps = {
//     fuzzy: false,
//     allowInput: true
//   }

//   compute (input) {
//     if (this.props.text == null) return []

//     const result = match({input, text: this.props.text, fuzzy: this.props.fuzzy})
//     return result
//   }

//   decorate (input) {
//     if (input == null || input === '') {
//       return []
//     } else {
//       return [{
//         words: [{text: this.props.text, input: false}],
//         remaining: input,
//         score: 1
//       }]
//     }
//   }

//   describe () {
//     if (this.props.decorate) {
//       if (this.props.allowInput) {
//         return (
//           <choice>
//             <literal {...this.props} decorate={false} />
//             <raw function={this.decorate.bind(this)} />
//           </choice>
//         )
//       } else {
//         return <raw function={this.decorate.bind(this)} />
//       }
//     } else {
//       return <raw function={this.compute.bind(this)} category={this.props.category} />
//     }
//   }
// }
