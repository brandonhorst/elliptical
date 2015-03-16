/** @jsx createElement */
import _ from 'lodash'
import {createElement, Phrase} from 'lacona-phrase'

export default class Repeat extends Phrase {
  static get defaultProps() {
    return {
      max: Number.MAX_SAFE_INTEGER,
      min: 1,
      unique: false
    }
  }

  filter(result) {
    if (this.props.unique && _.isPlainObject(result) && result.repeat) {
      return !_.includes(result.repeat, result.child)
    }
    return true

  }

  getValue(result) {
    if (_.isPlainObject(result) && result.repeat) {
      if (result.child) {
        return result.repeat.concat([result.child])
      } else {
        return result.repeat
      }
    } else {
      return [result]
    }
  }

  describe() {
    let child, separator

    if (this.props.children.length > 0 && this.props.children[0].Constructor === 'content') {
      child = this.props.children[0].children[0]
      if (this.props.children.length > 1 && this.props.children[1].Constructor === 'separator') {
        separator = this.props.children[1].children[0]
      }
    } else {
      child = this.props.children[0]
    }

    if (this.props.max === 1) {
      return child
    } else {
      const childWithId = _.merge({}, child, {props: {id: 'child'}})
      const content = separator ? <sequence merge={true}>{childWithId}{separator}</sequence> : childWithId

      const recurse = (
        <sequence>
          {content}
          <repeat id='repeat' unique={this.props.unique} max={this.props.max - 1} min={this.props.min - 1}>
            {this.props.children}
          </repeat>
        </sequence>
      )

      if (this.props.min <= 1) {
        return <choice>{child}{recurse}</choice>
      } else {
        return recurse
      }
    }
  }

}
