import React from 'react'
import Icons from '../../images/svgs/icons.js'
import { ago } from '../../js/time.js'

export default class Errors extends React.Component {
  constructor () {
    super()

    this.state = {
      showErrors: false
    }
  }

  errorList = () => {
    return this.state.showErrors
      ? (
        <ul>
          {this.props.errors.map(element => {
            return (
              <li className='listItem'>
                <h5>{element.title}</h5>
                <p>{element.message} <i>({ago(element.time)} ago)</i></p>
              </li>
            )
          })}
        </ul>
      )
      : null
  }

  toggleErrors = () => {
    this.setState({ showErrors: !this.state.showErrors }, () => {
      // After the user toggles errorview, we remove errors
      // See no reason to use time and screenposition
      // for displaying errors to users
      if (!this.state.showErrors) this.props.clearErrors()
    })
  }

  render () {
    if (this.props.errors.length === 0) return null

    return (
      <div className='error'>

        <a href='#' className='warningBtn' onClick={this.toggleErrors}>
          <Icons icon='error' />
        </a>

        {this.errorList()}
      </div>
    )
  }
}
