import _ from 'lodash'

function * traverse (option, {children, next}) {
  const trueOption = _.assign({}, option, {callbacks: []})

  for (let output of next(trueOption, children[0])) {
    // filter items that haven't consumed the text
    if (output.text === '' || output.text == null) {
      // call all limit callbacks
      _.forEach(output.callbacks, (callback) => callback())

      // remote callbacks
      const newOutput = _.clone(output)
      delete newOutput.callbacks

      yield newOutput
    }
  }
}

export default {traverse}
