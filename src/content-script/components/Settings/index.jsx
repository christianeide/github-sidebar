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
    const name = target.name

    let value
    switch (target.type) {
      case 'checkbox':
        value = target.checked
        break
      case 'number':
        value = target.value ? parseInt(target.value) : ''
        break
      default:
        value = target.value
    }

    this.setState({ [name]: value })
  }

  validateInput = (event) => {
    function imposeMinMax (el) {
      const min = parseInt(el.min)
      const max = parseInt(el.max)

      if (el.value !== '') {
        const value = parseInt(el.value)
        if (value < min) {
          return min
        }
        if (value > max) {
          return max
        }
        return value
      }

      return min || 0
    }

    const target = event.target
    const name = target.name
    const value = imposeMinMax(target)

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
    const { repos, listItemOfType, numberOfItems, autoRefresh, updateFavicon, token, timeBeforeStale } = this.state

    const remaing = rateLimit
      ? <em>({rateLimit.remaining} requests left of {rateLimit.limit}. Resets in {until(rateLimit.resetAt)})</em>
      : <em>(Loading...)</em>

    const canAddRepo = canAddRepository(repos)

    return (
      <main className='settings'>
        <ul>
          <li className='list'>
            <h4>Repositories</h4>
            <p>Navigate to a Github-repository you want to monitor and click the button below.</p>
            <SortRepos
              repos={repos}
              sortRepos={this.handleSortRepos}
              removeRepo={this.handleRemoveRepo}
            />
            <button className='add' onClick={this.handleAddPage} disabled={!canAddRepo}>Add current repository</button>
          </li>

          <li className='list miscellaneous'>
            <h4>Options</h4>
            <label>Show items from
              <select name='listItemOfType' value={listItemOfType} onChange={this.handleInputChange}>
                <option value='pullRequests'>Pull requests</option>
                <option value='issues'>Issues</option>
              </select>
            </label>

            <label>
              Number of items to load
              <input
                type='number'
                name='numberOfItems'
                min='0'
                max='10'
                value={numberOfItems}
                onChange={this.handleInputChange}
                onBlur={this.validateInput}
              />
            </label>

            <label>
              Auto refresh every X seconds.
              <input
                type='number'
                name='autoRefresh'
                min='15'
                value={autoRefresh}
                onChange={this.handleInputChange}
                onBlur={this.validateInput}
              />
            </label>

            <label>
              Hours before an item is marked as stale/yellow (0=never)
              <input
                type='number'
                name='timeBeforeStale'
                min='0'
                value={timeBeforeStale}
                onChange={this.handleInputChange}
                onBlur={this.validateInput}
              />
            </label>

            <label>
              <input
                type='checkbox'
                name='updateFavicon'
                checked={updateFavicon}
                onChange={this.handleInputChange}
              /> Show a badge in favicon if new items?
            </label>

            <label>Access token

              <input
                type='text'
                name='token'
                value={token}
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
