import React from 'react'
import _ from 'lodash'
import ReplSourceFile from './ReplSourceFile'
import ReplContext from '../common/ReplContext'
import ReplCommon from '../common/ReplCommon'
import { EOL } from 'os'
import ReplActions from '../actions/ReplActions'
import ReplOutput from '../common/ReplOutput'

const STACK_TRACE_PRIMARY_PATTERN = /(?:at\s*)([^(]+)\(?([^:]+):(\d+):(\d+)\)?/
const STACK_TRACE_SECONDARY_PATTERN = /(?:at\s*)()([^:]+):(\d+):(\d+)/
export default class ReplEntryOutputError extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      collapse: props.collapse == null ? true : props.collapse
    }
    
    let error = props.error
    console.log(`error:`, error)
    this.onToggleCollapse = this.onToggleCollapse.bind(this)
    this.bindObjectToContext = this.bindObjectToContext.bind(this)
    
    if (error instanceof SyntaxError && !error.stack.match(/^SyntaxError:/)) {
      let [file, errorBody, caret] = error.stack.split(EOL)
      let caretPosition = caret.indexOf('^')
      let [start, mid, end] = [
        errorBody.substring(0, caretPosition),
        errorBody.substring(caretPosition, caret.length),
        errorBody.substring(caret.length)
      ]
      let errorFile
      if (/mancy-repl:/.test(file)) {
      } else {
        errorFile = this.highlightSyntaxErrorMessage(file.trim())
      }
      this.syntaxError = <div className="syntax-error">
        <span
          dangerouslySetInnerHTML={{ __html: ReplCommon.highlight(start) }}></span>
        <span className="err-underline">{mid}</span>
        <span
          dangerouslySetInnerHTML={{ __html: ReplCommon.highlight(end) }}></span>
        {'\n'}
        <div className='repl-entry-output-error-stack-lines'>
        <span
          className='error-description'>{error.message}</span>{errorFile &&
        <span
          className="err-filename"> ({errorFile})</span>}
        </div>
      </div>
      this.stacktrace = []
    } else {
      this.handleStack(error)
    }
  }
  
  bindObjectToContext () {
    ReplActions.bindObjectToContext(this.props.error, ReplOutput.transformObject(this.props.error))
  }
  
  onToggleCollapse () {
    this.setState({
      collapse: !this.state.collapse
    })
  }
  
  highlightMessage (message) {
    let output
    message.replace(/^([^:]+):(.*)$/, (match, p1, p2) => {
      if (p1 && p2) {
        output =
          <span className='repl-entry-output-error-message-heading'>
            <span className='error-name'>{p1}</span>:<span
            className='error-description'>{p2}</span>
          </span>
      }
    })
    return output
  }
  
  highlightSyntaxErrorMessage (message) {
    let output
    message.replace(/^([^:]+):(.*)$/, (match, p1, p2) => {
      if (p1 && p2) {
        output =
          <span className='repl-entry-output-error-message-heading'>
            <span className='error-name'><ReplSourceFile location={p1}
                                                         name={p1}/></span>:<span
            className='error-description'>{p2}</span>
          </span>
      }
    })
    return output
  }
  
  handleStack (error) {
    if (error && error.stack) {
    } else {
      this.message = <span className='repl-entry-output-error-message-heading'>
            <span className='error-name'>Thrown</span>:<span
        className='error-description'>{error != null
        ? error.toString()
        : JSON.stringify(error)}</span>
          </span>
      this.stacktrace = []
    }
    let stack = error.stack
    let lines = stack.split(EOL)
    
    let messageLines = []
    let output = []
    let filler = (match, p1, p2, p3, p4) => {
      let openBrace = '', closeBrace = ''
      if (p1.trim().length) {
        openBrace = '('
        closeBrace = ')'
      }
      let context = ReplContext.getContext()
      let location = ReplCommon.getModuleSourcePath(p2, context.module.paths)
      if (location) {
        p2 = <ReplSourceFile location={location} name={p2}/>
      }
      
      output.push(
        <div className='repl-entry-output-error-stack-lines'
             key={output.length}>
          <span className='stack-error-at'>&nbsp;&nbsp;at&nbsp;</span>
          <span className='stack-error-function'>{p1}</span>
          {openBrace}
          <span className='stack-error-file'>{p2}</span>:
          <span className='stack-error-row'>{p3}</span>:
          <span className='stack-error-column'>{p4}</span>
          {closeBrace}
        </div>
      )
      return ''
    }
    
    _.each(lines, (s, i) => {
      if (i === 0) {
        messageLines.push(s)
        return
      }
      let pattern = s.indexOf('(') !== -1
        ? STACK_TRACE_PRIMARY_PATTERN
        : STACK_TRACE_SECONDARY_PATTERN
      if (!pattern.test(s)) {
        messageLines.push(s)
        return
      }
      s.replace(pattern, filler)
    })
    
    this.stacktrace = output
    this.message = this.highlightMessage(messageLines.join(EOL))
  }
  
  render () {
    return (
      <span className='repl-entry-output-error'>
        {
          this.syntaxError
            ? <span className='repl-entry-output-error-message'>
                {this.syntaxError}
              </span>
            : this.state.collapse
            ? <span className='repl-entry-output-error-message'>
                  <i className='fa fa-play' onClick={this.onToggleCollapse}></i>
              {this.message}
                </span>
            : <span className='repl-entry-output-error-message'>
                  <i className='fa fa-play fa-rotate-90'
                     onClick={this.onToggleCollapse}></i>
              {this.message}
              <i className='fa fa-hashtag' title='Store as Global Variable'
                 onClick={this.bindObjectToContext}></i>
                  <span className='repl-entry-output-error-stack'>
                    {this.stacktrace}
                  </span>
                </span>
        }
      </span>
    )
  }
}
