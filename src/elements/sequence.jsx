/** @jsx createElement */
import {createElement} from '../create-element'
import InputOption from '../input-option'

import {Separator, Content} from './noop'

import _ from 'lodash'

function addSeparator (child, separator, Phrase) {
  if (child.element.props.optional) {
    return new Phrase(
      <Sequence optional={true}>
        <child.elementConstructor {...child.element.props} optional={false} />
        <separator.elementConstructor {...separator.element.props} />
      </Sequence>
    )
  } else {
    return new Phrase(
      <Sequence>
        <child.elementConstructor {...child.element.props} />
        <separator.elementConstructor {...separator.element.props} />
      </Sequence>
    )
  }
}

export default class Sequence {
  _handleParse(input, options, applyLimit, data, done) {
    let actualChildren
    if (this.props.children.length > 0 && this.props.children[0].elementConstructor === 'content') {
      const content = this.props.children[0].element.props.children
      if (this.props.children.length > 1 && this.props.children[1].elementConstructor === 'separator') {
        const separator = this.props.children[1].element.props.children[0]
        actualChildren = content.slice(0, -1)
          .map((child) => addSeparator(child, separator, options.Phrase))
          .concat(content[content.length - 1])
      } else {
        actualChildren = content
      }
    } else {
      actualChildren = this.props.children
    }

    var parsesActive = 0

    const parseChild = (childIndex, input) => {
      const childData = (input) => {
        var newInputData
        if (childIndex === actualChildren.length - 1) {
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
      actualChildren[childIndex].parse(input, options, childData, childDone)
    }

    parseChild(0, input)
  }
}
