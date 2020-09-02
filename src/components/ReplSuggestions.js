import React from 'react'
import _ from 'lodash'
import ReplSuggestionStore from '../stores/ReplSuggestionStore'
import Reflux from 'reflux'
import md5 from 'md5'
import { EOL } from 'os'
import ReplType from '../common/ReplType'
import ReplConstants from '../constants/ReplConstants'
import ReplDOM from '../common/ReplDOM'
import ReplDOMEvents from '../common/ReplDOMEvents'
import ReplActiveInputActions from '../actions/ReplActiveInputActions'

export default class ReplSuggestions extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      suggestions: [],
      selected: -1,
      id: null
    }
    this.onStateChange = this.onStateChange.bind(this)
    this.onWindowEvents = this.onWindowEvents.bind(this)
    this.onClickSuggestion = this.onClickSuggestion.bind(this)
    this.style = null
  }
  
  componentDidMount () {
    this.unsubscribe = ReplSuggestionStore.listen(this.onStateChange)
    window.addEventListener('keydown', this.onWindowEvents, false)
    window.addEventListener('blur', this.onWindowEvents, false)
  }
  
  componentWillUnmount () {
    this.unsubscribe()
    window.removeEventListener('keydown', this.onWindowEvents, false)
    window.addEventListener('blur', this.onWindowEvents, false)
  }
  
  onWindowEvents (e) {
    if (ReplDOMEvents.isEscape(e)) {
      this.setState({
        suggestions: [],
        selected: -1
      })
      ReplActiveInputActions.resetTabCompleteSuggestion()
    } else if ((ReplDOMEvents.isKeyup(e) || ReplDOMEvents.isKeydown(e)) &&
      this.state.suggestions.length) {
      let direction = ReplDOMEvents.isKeydown(e) ? 1 : -1
      let noOfSuggestions = this.state.suggestions.length
      let next = this.state.selected + direction
      
      if (next < 0) {
        next = noOfSuggestions - 1
      } else if (next >= noOfSuggestions) {
        next = 0
      }
      this.setState({
        selected: next
      })
      
      // scroll to selected element
      let suggestionList = document.getElementsByClassName('repl-prompt-suggestion-list')[0]
      if (suggestionList) {
        suggestionList.scrollTop = (suggestionList.scrollHeight /
          this.state.suggestions.length) * next
      }
      ReplActiveInputActions.tabCompleteSuggestion(this.state.suggestions[next], this.state.id)
    }
  }
  
  onStateChange (data) {
    let { suggestions, input, id } = data
    suggestions = _.map(suggestions, (suggestion) => {
      return {
        key: md5(suggestion.text),
        type: ReplType.getTypeName(suggestion.type),
        typeHint: ReplType.getTypeNameShort(suggestion.type),
        expect: suggestion.text.substring(suggestion.completeOn.length),
        input: suggestion.completeOn
      }
    })
    
    let selected = suggestions.length ? 0 : -1
    this.setState({
      suggestions: suggestions,
      selected: selected,
      id
    })
    
    if (selected !== -1) {
      ReplActiveInputActions.tabCompleteSuggestion(suggestions[selected], id)
    } else {
      ReplActiveInputActions.resetTabCompleteSuggestion()
    }
  }
  
  onClickSuggestion (idx) {
    let clickAction = (e) => {
      this.setState({
        suggestions: this.state.suggestions,
        selected: idx,
        id: this.state.id
      })
      ReplActiveInputActions.fillTabCompleteSuggestion(this.state.suggestions[idx], this.state.id)
    }
    return clickAction
  }
  
  render () {
    let style = this.state.suggestions.length && this.state.id
      ? ReplDOM.getAutoCompletePosition(this.state.id) : null
    return (
      <div className='repl-prompt-suggestion-wrapper' style={style}>
        {
          this.state.suggestions.length && style
            ?
            <ol className='repl-prompt-suggestion-list'>
              {
                _.map(this.state.suggestions, (suggestion, idx) => {
                  return (
                    <li className='repl-prompt-suggestion' data-index={idx}
                        key={suggestion.key}
                        data-selected={this.state.selected === idx}
                        onClick={this.onClickSuggestion(idx)}
                        title={(suggestion.input + suggestion.expect).trim()}>
                    <span className='repl-prompt-suggestion-type'
                          title={suggestion.type}>
                      {suggestion.typeHint}
                    </span>
                      <span className='repl-prompt-suggestion-text'>
                      <span
                        className='repl-prompt-suggestion-highlight'>{suggestion.input.replace(/\n+/g, '')}</span>
                      <span
                        className='repl-prompt-suggestion-expect'>{suggestion.expect.replace(/\n+/g, '')}</span>
                    </span>
                    </li>
                  )
                })
              }
            </ol>
            : null
        }
      </div>
    )
  }
}
