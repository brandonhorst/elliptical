/** @jsx createElement */
import _ from 'lodash'
import {createElement} from 'lacona-phrase'
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

  _handleParse(input, options) {
    const outputs = []

    const parseChild = (childIndex, input) => {
      this.children[childIndex].parse(input, options).forEach(output => {
        if (childIndex === this.children.length - 1) {
          outputs.push(output.update('result', result => result.set(this.props.id, this.props.value)))
        } else {
          parseChild(childIndex + 1, output)
        }
      })
    }

    parseChild(0, input)
    return outputs
  }
}
