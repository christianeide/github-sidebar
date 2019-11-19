/** @jsx h */
import { Component, h, createRef } from 'preact'
import SortRepos from './sortRepos.jsx'
import { until } from '../../utils/time.js'
import arrayMove from 'array-move'
import { getCurrentPath, canAddRepository } from './getPath.js'

import './settings.scss'

const debounce = (func, delay) => {
  let inDebounce
  return function () {
    const context = this
    const args = arguments
    clearTimeout(inDebounce)
    inDebounce = setTimeout(() => func.apply(context, args), delay)
  }
}

export default class Settings extends Component {
  constructor (props) {
    super(props)

    // We copy parent props to state only on mount of component
    // We use theese props as a startingpoint when we edit settings
    this.state = {
      ...props.settings,
      settingsSaved: false
    }

    this.timer = null
    this.mainContRef = createRef()
  }

  componentWillUnmount () {
    // Save settings when we go back
    this.saveSettings()

    clearTimeout(this.timer)
  }

  componentDidUpdate (prevProps) {
    if (this.state.settingsSaved) {
      // Clear timer before we start a new
      if (this.timer) {
        clearTimeout(this.timer)
        this.timer = null
      }

      // Set a timer to show the save confirmation for a given time in ms
      this.timer = setTimeout(() => {
        this.setState({ settingsSaved: false })

        this.timer = null
      }, 2000)
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

    this.handleSaveSettings()
  }

  handleValidateInput = (event) => {
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

    this.handleSaveSettings()
  }

  handleAddPage = () => {
    const repo = getCurrentPath()

    if (!repo) return

    this.setState(prevState => ({
      repos: [...prevState.repos, repo]
    }))

    this.handleSaveSettings()
  }

  handleSortRepos = ({ oldIndex, newIndex }) => {
    this.setState(({ repos }) => ({
      repos: arrayMove(repos, oldIndex, newIndex)
    }))

    this.handleSaveSettings()
  }

  handleRemoveRepo = (e) => {
    const indexToRemove = parseInt(e.target.getAttribute('data-index'))

    this.setState(({ repos }) => ({
      repos: repos.filter((repo, index) => index !== indexToRemove)
    }))

    this.handleSaveSettings()
  }

  handleSaveSettings = debounce(() => {
    this.saveSettings()
  }, 500)

  saveSettings = () => {
    this.props.port.postMessage({ type: 'saveSettings', settings: this.state })
    this.setState({ settingsSaved: true })
  }

  getRef = () => this.mainContRef;

  setRef = (el) => { this.mainContRef = el }

  render () {
    const { rateLimit } = this.props
    const { repos, listItemOfType, numberOfItems, autoRefresh, updateFavicon, token, sortBy, theme, settingsSaved } = this.state

    const remaing = rateLimit
      ? <em>({rateLimit.remaining} requests left of {rateLimit.limit}. Resets in {until(rateLimit.resetAt)})</em>
      : <em>(Loading...)</em>

    const canAddRepo = canAddRepository(repos)

    return (
      <main className='settings' ref={this.setRef}>
        <ul>
          <li className='list'>
            <h4>Repositories</h4>
            <p>Navigate to a Github-repository you want to monitor and click the button below.</p>
            <SortRepos
              items={repos}
              onSortEnd={this.handleSortRepos}
              helperClass='github-sidebar-sort'
              onRemoveRepo={this.handleRemoveRepo}
              pressDelay={100}
              lockAxis='y'
              helperContainer={this.getRef}
            />
            <button className='add' onClick={this.handleAddPage} disabled={!canAddRepo}>Add current repository</button>
          </li>

          <li className='list miscellaneous'>
            <h4>Options</h4>
            <label>Show items from
              <select name='listItemOfType' value={listItemOfType} onChange={this.handleInputChange}>
                <option value='all'>Pull requests and issues</option>
                <option value='pullRequests'>Pull requests</option>
                <option value='issues'>Issues</option>
              </select>
            </label>

            <label>Sort items by
              <select name='sortBy' value={sortBy} onChange={this.handleInputChange}>
                <option value='CREATED_AT'>Created</option>
                <option value='UPDATED_AT'>Updated</option>
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
                onBlur={this.handleValidateInput}
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
                onBlur={this.handleValidateInput}
              />
            </label>

            <label>Theme
              <select name='theme' value={theme} onChange={this.handleInputChange}>
                <option value='dark'>Dark</option>
                <option value='light'>Light</option>
              </select>
            </label>

            <label>
              <input
                type='checkbox'
                name='updateFavicon'
                checked={updateFavicon}
                onChange={this.handleInputChange}
              /> Highlight favicon if new/updated items?
            </label>

            <label>Access token

              <input
                type='text'
                name='token'
                value={token}
                onChange={this.handleInputChange}
                placeholder='Access token'
              />
            </label>

            {remaing}

            <div className='credit'>
              <a href='https://github.com/christianeide/github-sidebar'>
                Github Sidebar {process.env.npm_package_version}
              </a>
            </div>
          </li>

        </ul>

        {<div className={`autoSave ${settingsSaved && 'show'}`}>Settings saved...</div>}
      </main>
    )
  }
}
