import React from 'react';
import _ from 'lodash';
import ReplOutput from '../common/ReplOutput';
import ReplCommon from '../common/ReplCommon';
import ReplOutputObject from './ReplOutputObject';
import ReplActions from '../actions/ReplActions';

export default class ReplOutputFunction extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      collapse: props.collapse == null ? true : props.collapse,
      funCollapse: true
    }

    this.onToggleCollapse = this.onToggleCollapse.bind(this);
    this.onToggleFunCollapse = this.onToggleFunCollapse.bind(this);
    this.getType = this.getType.bind(this);
    this.getAllProps = this.getAllProps.bind(this);
    this.bindObjectToContext = this.bindObjectToContext.bind(this);
  }

  shouldComponentUpdate(nextProps, nextState) {
    return !(_.isEqual(nextState, this.state) && _.isEqual(nextProps, this.props));
  }

  onToggleCollapse() {
    this.setState({
      collapse: !this.state.collapse
    });
  }

  onToggleFunCollapse() {
    this.setState({
      funCollapse: !this.state.funCollapse
    });
  }

  getType() {
    let type = ReplCommon.funType(this.props.fun);
    return ` ${type} {}`;
  }

  getAllProps() {
    let names = Object.getOwnPropertyNames(this.props.fun);
    let symbols = Object.getOwnPropertySymbols(this.props.fun);
    return _.sortBy(names.concat(symbols), (value) => {
      return value.toString();
    });
  }

  bindObjectToContext() {
    ReplActions.bindObjectToContext(this.props.fun, ReplOutput.transformObject(this.props.fun));
  }

  render() {
    let label = ReplCommon.highlight(this.getType());
    return (
      <span className='repl-entry-message-output-object-folds'>
        {
          this.state.collapse
          ? <span className='repl-entry-message-output-object'>
              <i className='fa fa-play' onClick={this.onToggleCollapse}></i>
              <span className='object-desc' dangerouslySetInnerHTML={{__html:label}}></span>
            </span>
          : <span className='repl-entry-message-output-object'>
              <i className='fa fa-play fa-rotate-90' onClick={this.onToggleCollapse}></i>
              <span className='object-desc' dangerouslySetInnerHTML={{__html:label}}></span>
              <i className='fa fa-hashtag' title='Store as Global Variable' onClick={this.bindObjectToContext}></i>
              <span className='object-rec'>
              {
                _.map(this.getAllProps(), (key) => {
                  let value = ReplOutput.readProperty(this.props.fun, key);
                  let keyClass = Object.prototype.propertyIsEnumerable.call(this.props.fun, key) ? 'object-key' : 'object-key dull';
                  return (
                    <div className='object-entry' key={key.toString()}>
                      {
                        <span className={keyClass}>
                          {key.toString()}
                          <span className='object-colon'>: </span>
                        </span>
                      }
                      {
                        value && value._isReactElement
                          ? value
                          : ReplOutput.transformObject(value)
                      }
                    </div>
                  )
                })
              }
              {
                this.props.fun.__proto__
                ?  <div className='object-entry' key='prototype'>
                      __proto__
                      <span className='object-colon'>: </span>
                      <ReplOutputObject object={Object.getPrototypeOf(this.props.fun)} primitive={false}/>
                  </div>
                : null
              }
              {
                this.props.expandable
                  ? this.state.funCollapse
                      ? <span className='repl-entry-message-output-function'>
                          <i className='fa fa-plus-square-o' onClick={this.onToggleFunCollapse}></i>
                          <span dangerouslySetInnerHTML={{__html:this.props.short}}></span>
                        </span>
                      : <span className='repl-entry-message-output-function'>
                          <i className='fa fa-minus-square-o' onClick={this.onToggleFunCollapse}></i>
                          <span dangerouslySetInnerHTML={{__html:this.props.html}}></span>
                        </span>
                  : <span className='repl-entry-message-output-function' dangerouslySetInnerHTML={{__html:this.props.html}}>
                    </span>
              }
              </span>
            </span>
        }
      </span>
    );
  }
}
