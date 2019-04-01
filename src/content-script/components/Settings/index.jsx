import React from 'react'
import SortRepos from './sortRepos.jsx'
import { until } from '../../js/time.js'
import arrayMove from 'array-move'
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

    console.log('name', name, 'value', value)

    this.setState({
      [name]: value
    })
  }

  timeUntil (updatedAt) {
    const d = new Date(updatedAt)
    return until(d.getTime())
  }

  handleSaveSettings = () => {
    this.props.saveSettings(this.state)
  }

  handleAddPage =() => {
    const href = window.location.pathname
    const urlItems = href.split('/')
    const repo = {
      owner: urlItems[1],
      name: urlItems[2]
    }

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
    console.log(this.state)
    const { rateLimit } = this.props

    const remaing = rateLimit ? <em>({rateLimit.remaining} requests left of {rateLimit.limit}. Resets in {this.timeUntil(rateLimit.resetAt)})</em> : null

    return (
      <main className='settings'>
        <label>
          This extension requires an access token from Github to load data. <br />
          <a href='https://github.com/settings/tokens/new?scopes=repo&description=Github%20sidebar%20browser%20extension' target='_blank' >
            Create an access token
          </a> and paste it below. <em>(We have pre-selected the necessary scopes)</em>

          <input
            type='text'
            name='token'
            value={this.state.token}
            onChange={this.handleInputChange}
            placeholder='Access token' />
          {remaing}
        </label>

        <button onClick={this.handleAddPage}>Add current page</button>
        <SortRepos
          repos={this.state.repos}
          sortRepos={this.handleSortRepos}
          removeRepo={this.handleRemoveRepo}
        />

        <label>
          <input
            type='checkbox'
            name='autoUpdate'
            checked={this.state.autoUpdate}
            onChange={this.handleInputChange}
          /> Autoupdate data in the background when a page is idle? <em>(Data is always updated when the page reloads)</em>
        </label>

        <label className={this.state.autoUpdate ? '' : 'disabled'}>
          Minutes before autoupdate
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

        <label>
          Show items from
          <select name='listItemOfType' value={this.state.listItemOfType} onChange={this.handleInputChange}>
            <option value='none'>None</option>
            <option value='pullRequests'>Pull requests</option>
            <option value='issues'>Issues</option>
          </select>
        </label>

        <label className={this.state.listItemOfType === 'none' ? 'disabled' : ''}>
          Number of recent items to load
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

        <label className={this.state.listItemOfType === 'none' ? 'hide' : ''}>
          <input
            type='checkbox'
            name='updateFavicon'
            checked={this.state.updateFavicon}
            onChange={this.handleInputChange}
          /> Show a badge in favicon if new {this.state.listItemOfType}?
        </label>

        <label>
          Show Github Sidebar on
          <select name='viewportSide' value={this.state.viewportSide} onChange={this.handleInputChange}>
            <option value='left'>Left</option>
            <option value='right'>Right</option>
          </select>
        </label>

        <button onClick={this.handleSaveSettings}>Save settings</button>
      </main>
    )
  }
}
