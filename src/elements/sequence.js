var createPhrase = require('../create-phrase')
var InputOption = require('../input-option')

var _ = require('lodash')

var sequence

function addSeparator (child, separator) {
  var newChild, newProps

  if (child.props.optional) {
    newProps = _.clone(child.props)
    newProps.optional = false

    newChild = child.factory(newProps)

    return sequence({
      optional: 'true',
      children: [newChild, separator]
    })
  } else {
    return sequence({
      children: [child, separator]
    })
  }
}

sequence = createPhrase({
  name: 'sequence',
  // take the props, and set the actualChildren property
  onCreate() {
    if (this.props.separator) {
      this.actualChildren = this.props.children.slice(0, -1)
        .map((child) => addSeparator(child, this.props.separator))
        .concat(this.props.children[this.props.children.length - 1])
    } else {
      this.actualChildren = this.props.children
    }
  },
  _handleParse(input, options, applyLimit, data, done) {
    var parsesActive = 0

    const parseChild = (childIndex, input) => {
      const childData = (input) => {
        var newInputData
        if (childIndex === this.actualChildren.length - 1) {
          newInputData = input.getData()
          newInputData.result[this.props.id] = this.props.value
          data(new InputOption(newInputData))
        } else {
          parseChild(childIndex + 1, input)
        }
      }

      const childDone = (err) => {
        if (err) {
          done(err)
        } else {
          parsesActive--
          if (parsesActive === 0) {
            done()
          }
        }
      }

      parsesActive++
      this.actualChildren[childIndex].parse(input, options, childData, childDone)
    }

    parseChild(0, input)
  }
})

module.exports = sequence
