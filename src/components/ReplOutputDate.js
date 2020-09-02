import React from 'react'
import ReplOutputObject from './ReplOutputObject'
import _ from 'lodash'
import ReplActions from '../actions/ReplActions'
import ReplOutput from '../common/ReplOutput'

export default class ReplOutputDate extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      collapse: props.collapse == null ? true : props.collapse
    }
    this.onToggleCollapse = this.onToggleCollapse.bind(this)
    this.bindObjectToContext = this.bindObjectToContext.bind(this)
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
  
  bindObjectToContext () {
    ReplActions.bindObjectToContext(this.props.date, ReplOutput.transformObject(this.props.date))
  }
  
  render () {
    return (
      <span className='repl-entry-message-output-object-folds'>
        {
          this.state.collapse
            ? <span className='repl-entry-message-output-object'>
                <i className='fa fa-play' onClick={this.onToggleCollapse}></i>
                <i className='fa fa-calendar' title='Date'></i>
                <span
                  className='objec-desc date'>{this.props.date.toLocaleString()}</span>
              </span>
            : <span className='repl-entry-message-output-object'>
                <i className='fa fa-play fa-rotate-90'
                   onClick={this.onToggleCollapse}></i>
                <i className='fa fa-calendar' title='Date'></i>
                <span
                  className='object-desc'>{this.props.date.toLocaleString()}</span>
                          <i className='fa fa-hashtag'
                             title='Store as Global Variable'
                             onClick={this.bindObjectToContext}></i>

                <span className='object-rec'>
                  {
                    this.props.date.__proto__
                      ? <div className='object-entry' key='prototype'>
                        __proto__
                        <span className='object-colon'>: </span>
                        <ReplOutputObject
                          object={Object.getPrototypeOf(this.props.date)}
                          primitive={false}/>
                      </div>
                      : null
                  }
                </span>
              </span>
        }
      </span>
    )
  }
}
