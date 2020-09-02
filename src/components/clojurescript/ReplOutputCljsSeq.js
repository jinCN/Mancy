import React from 'react'
import _ from 'lodash'
import ReplOutput from '../../common/ReplOutput'
import ReplConstants from '../../constants/ReplConstants'

export default class ReplOutputCljsSeq extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      collapse: props.collapse == null ? true : props.collapse
    }
    const type = this.props.token.type
    const parts = type.split(/[\s.]/)
    this.type = parts[parts.length - 1]
    this.onToggleCollapse = this.onToggleCollapse.bind(this)
  }
  
  shouldComponentUpdate (nextProps, nextState) {
    return !(_.isEqual(nextState, this.state) &&
      _.isEqual(nextProps, this.props))
  }
  
  onToggleCollapse () {
    this.setState({
      collapse: !this.state.collapse
    })
  }
  
  getKeysButLength () {
    let keys = Object.keys(this.props.array)
    return keys.slice(0, keys.length)
  }
  
  getShortSeq () {
    const arr = this.props.array
    const SHORT_LEN = ReplConstants.CLJS_SEQ_TRUNCATE_LENGTH
    const element =
      <span className='array-desc'>
        <span className='prefix cm-bracket'>{this.props.token.prefix}</span>
        {this.getSeqRecords(Math.min(arr.length, SHORT_LEN))}
        {
          arr.length > SHORT_LEN
            ? <span className='ellipsis' onClick={this.onToggleCollapse}></span>
            : null
        }
        <span className='suffix cm-bracket'>{this.props.token.suffix}</span>
      </span>
    
    return { short: arr.length <= SHORT_LEN, element: element }
  }
  
  buildMapData (arr, result = []) {
    for (let pos = 0; pos + 1 < arr.length; pos += 2) {
      const key = arr[pos]
      const value = arr[pos + 1]
      result.push(
        <div className='array-entry' key={pos}>
          <span className='map-key cm-atom'>{key.toString()}</span>
          <span className='map-value'>
            {value && value._isReactElement
              ? { value }
              : ReplOutput.clojure(value).view()}
          </span>
        </div>
      )
    }
    return result
  }
  
  getSeqRecords (len = -1) {
    const clazz = `${len !== -1 ? 'inline' : ''}  array-rec`
    const type = this.type
    const mapType = this.props.token.arity === 2
    let keys = this.getKeysButLength()
    keys = len !== -1 ? keys.slice(0, len) : keys
    return (
      <span className={clazz}>
      {
        !mapType
          ? _.map(keys, (key) => {
            let value = this.props.array[key]
            let idx = parseInt(key, 10)
            return (
              <div className='array-entry' key={idx}
                   title={type + ': ' + (this.props.start + idx)}>
                {len === -1 ? <span className='array-idx'> {this.props.start +
                idx}: </span> : null}
                {value && value._isReactElement
                  ? { value }
                  : ReplOutput.clojure(value).view()}
              </div>
            )
          })
          : this.buildMapData(this.props.array.slice(0, keys.length))
      }
      </span>
    )
  }
  
  render () {
    const { short, element } = this.getShortSeq()
    const title = this.props.length || ''
    return (
      <span className='repl-entry-message-output-array-folds'>
        {
          short
            ? <span className='repl-entry-message-output-array' title={title}>
                {element}
              <span className='cljs-tag'
                    title={this.props.token.type}>{this.type}</span>
              </span>
            : this.state.collapse
            ? <span className='repl-entry-message-output-array' title={title}>
                  <i className='fa fa-play' onClick={this.onToggleCollapse}></i>
              {element}
              <span className='cljs-tag'
                    title={this.props.token.type}>{this.type}</span>
                </span>
            : <span className='repl-entry-message-output-array' title={title}>
                  <i className='fa fa-play fa-rotate-90'
                     onClick={this.onToggleCollapse}></i>
              {element}
              <span className='cljs-tag'
                    title={this.props.token.type}>{this.type}</span>
              {this.getSeqRecords()}
                </span>
        }
      </span>
    )
  }
}
