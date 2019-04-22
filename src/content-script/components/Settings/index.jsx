/* global chrome */

import React from 'react'
import SortRepos from './sortRepos.jsx'
import { until } from '../../js/time.js'
import arrayMove from 'array-move'
import { getCurrentPath, canAddRepository } from './getPath.js'

import './settings.scss'

export default class Settings extends React.Component {
  constructor (props) {
    super(props)

    // We copy parent props to state only on mount of component
    // We use theese props as a startingpoint when we edit settings
    this.state = {
      ...props.settings
    }
  }

  handleInputChange = (event) => {
    const target = event.target
    const value = target.type === 'checkbox' ? target.checked : target.value
    const name = target.name

    this.setState({ [name]: value })
  }

  handleSaveSettings = () => {
    chrome.runtime.sendMessage({ type: 'saveSettings', settings: this.state })
  }

  handleAddPage = () => {
    const repo = getCurrentPath()

    if (!repo) return

    this.setState(prevState => ({
      repos: [...prevState.repos, repo]
    }))
  }

  handleSortRepos = ({ oldIndex, newIndex }) => {
    this.setState(({ repos }) => ({
      repos: arrayMove(repos, oldIndex, newIndex)
    }))
  }

  handleRemoveRepo = (e) => {
    const indexToRemove = parseInt(e.target.getAttribute('data-index'))

    this.setState(({ repos }) => ({
      repos: repos.filter((repo, index) => index !== indexToRemove)
    }))
  }

  render () {
    const { rateLimit } = this.props

    const remaing = rateLimit ? <em>({rateLimit.remaining} requests left of {rateLimit.limit}. Resets in {until(rateLimit.resetAt)})</em> : null

    const canAddRepo = canAddRepository(this.state.repos)

    return (
      <main className='settings'>
        <ul>
          <li className='list'>
            <h4>Repositories</h4>
            <p>Navigate to a Github-repository you want to monitor and click the button below.</p>
            <SortRepos
              repos={this.state.repos}
              sortRepos={this.handleSortRepos}
              removeRepo={this.handleRemoveRepo}
            />
            <button className='add' onClick={this.handleAddPage} disabled={!canAddRepo}>Add current repository</button>
          </li>

          <li className='list'>
            <h4>Items</h4>
            <label>Show items from
              <select name='listItemOfType' value={this.state.listItemOfType} onChange={this.handleInputChange}>
                <option value='pullRequests'>Pull requests</option>
                <option value='issues'>Issues</option>
              </select>
            </label>

            <label className='margin-top'>
              Number of items to load
              <input
                type='number'
                name='numberOfItems'
                min='0'
                max='10'
                disabled={this.state.listItemOfType === 'none'}
                value={this.state.numberOfItems}
                onChange={this.handleInputChange}
              />
            </label>
          </li>

          <li className='list'>
            <h4>Autoupdate</h4>
            <label>
              Time before autoupdate (min.)
              <input
                type='number'
                name='autoRefresh'
                min='1'
                max='1000'
                disabled={!this.state.autoUpdate}
                value={this.state.autoRefresh}
                onChange={this.handleInputChange}
              />
            </label>
          </li>

          <li className='list'>
            <h4>Favicon</h4>
            <label>
              <input
                type='checkbox'
                name='updateFavicon'
                checked={this.state.updateFavicon}
                onChange={this.handleInputChange}
              /> Show a badge in favicon if new items?
            </label>
          </li>

          <li className='list'>
            <h4>Access token</h4>

            <label>This extension requires an access token from Github to load data. <br />
              <a href='https://github.com/settings/tokens/new?scopes=repo&description=Github%20sidebar%20browser%20extension' target='_blank' >
            Create an access token
              </a> and paste it below. <em>(The necessary scopes are pre-selected)</em>

              <input
                type='text'
                name='token'
                value={this.state.token}
                onChange={this.handleInputChange}
                placeholder='Access token' />
            </label>

            {remaing}
          </li>

        </ul>

        <button onClick={this.handleSaveSettings}>Save settings</button>

      </main>
    )
  }
}
