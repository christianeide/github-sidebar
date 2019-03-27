import React from 'react'
import { until } from '../../js/time.js'

export default class Settings extends React.Component {
  constructor (props) {
    super(props)

    // We copy parent props to state only on mount of component
    // We use theese props as a startingpoint when we edit settings
    this.state = {
      ...props.settings
    }
  }

  handleInputChange =(event) => {
    const target = event.target
    const value = target.type === 'checkbox' ? target.checked : target.value
    const name = target.name

    this.setState({
      [name]: value
    })
  }

  timeUntil (updatedAt) {
    const d = new Date(updatedAt)
    return until(d.getTime())
  }

  handleSaveSettings =() => {
    this.props.saveSettings(this.state)
  }

  render () {
    console.log(this.state)
    const { rateLimit } = this.props

    const remaing = rateLimit ? <em>({rateLimit.remaining} requests left of {rateLimit.limit}. Resets in {this.timeUntil(rateLimit.resetAt)})</em> : null

    return (
      <main className='settings'>
        <label>
          This extension requires an access token from Github to load data. <br />
          <a href='https://github.com/settings/tokens/new?scopes=repo&description=Github%20sidebar%20browser%20extension' target='_blank' >
            Create an access token
          </a> and paste it below.

          <input type='text' name='token' value={this.state.token} onChange={this.handleInputChange} placeholder='Access token' />
          {remaing}
        </label>

        {/* <label>
          Auto-update data in the background when a page is idle? <em>(Data from GitHub is always fetched when the page reloads)</em>
          <input
            name='autouodate'
            type='checkbox'
            checked={this.state.autouodate}
            onChange={this.handleInputChange}
          />
        </label>

        <label>
          Time before autoupdate
          <input
            name='autouodate'
            type='checkbox'
            checked={this.state.autouodate}
            onChange={this.handleInputChange}
          />
        </label>

        <label>
          Show
          <input
            name='autouodate'
            type='radio'
            checked={this.state.autouodate}
            onChange={this.handleInputChange}
          />
          <input
            name='autouodate'
            type='radio'
            checked={this.state.autouodate}
            onChange={this.handleInputChange}
          />
        </label>

        <label /> */}

        <button onClick={this.handleSaveSettings}>Save settings</button>
      </main>
    )
  }
}
