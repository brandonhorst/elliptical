/** @jsx createElement */
import _ from 'lodash'
import {createElement} from 'lacona-phrase'
import InputOption from '../input-option'
import {Phrase} from 'lacona-phrase'

function addSeparator (child, separator) {
  if (child.props.optional) {
    newChild = _.clone(child)
    newChild.props = _.clone(child.props)
    newChild.props.optional = false
    return <Sequence optional={true}>{newChild}{separator}</Sequence>
  } else {
    return <Sequence>{child}{separator}</Sequence>
  }
}

function getPieces (children) {
  let content, separator
  if (children.length > 0 && children[0].Constructor === 'content') {
    content = children[0].children
    if (children.length > 1 && children[1].Constructor === 'separator') {
      separator = children[1].children[0]
    }
  } else {
    content = children
  }
  return {content, separator}
}

export default class Sequence extends Phrase {
  constructor(props, Phrase) {
    const pieces = getPieces(props.children)
    if (pieces.separator) {
      this.children = _.chain(pieces.content.slice(0, -1))
        .map(_.partial(addSeparator, _, pieces.separator))
        .concat(_.last(pieces.content))
        .map(child => new Phrase(child))
        .value()
    } else {
      this.children = _.map(pieces.content, child => new Phrase(child))
    }
  }

  _handleParse(input, options, applyLimit, data, done) {

    var parsesActive = 0

    const parseChild = (childIndex, input) => {
      const childData = (input) => {
        var newInputData
        if (childIndex === this.children.length - 1) {
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
      this.children[childIndex].parse(input, options, childData, childDone)
    }

    parseChild(0, input)
  }
}
