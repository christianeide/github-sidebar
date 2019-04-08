/* global chrome */

import React from 'react'
import ReactDOM from 'react-dom'

import './css/index.scss'

//* ********* React components **********/
import Header from './components/Header/index.jsx'
import Repositories from './components/Repositories/index.jsx'
import Settings from './components/Settings/index.jsx'

//* ********* Functions **********/
import { fetchDataFromAPI } from './js/fetch.js'
import defaultSettings from './js/defaultSettings.json'

class App extends React.Component {
  constructor () {
    super()

    this.state = {
      repositories: [],
      rateLimit: null,
      showSettings: false,
      settings: null,
      loading: true,
      errors: [ ]
    }
  }

  componentDidMount () {
    // Uncomment this to erase chrome storage for developent
    // chrome.storage.local.clear(function () {
    //   var error = chrome.runtime.lastError
    //   if (error) {
    //     console.error(error)
    //   }
    // })

    chrome.storage.local.get(['settings', 'repositories', 'rateLimit'],
      ({ settings: settingsRaw, ...data }) => {
        // merges default settings and user settings
        const settings = { ...defaultSettings, ...settingsRaw }

        // Show settings if there is no token
        const showSettings = !settings.token

        this.setState({ settings, showSettings, loading: false, ...data })
      })

    // this.interval = setInterval(() => {
    //   this.fetchData(this.state.settings)
    // }, 1000)
  }

  componentDidUpdate (prevProps, prevState, snapshot) {
    if (this.state.settings !== prevState.settings) {
      this.fetchData(this.state.settings)
    }
  }

  componentWillUnmount () {
    clearInterval(this.interval)
  }

  fetchData (settings) {
    if (!settings.token) return

    this.setState({ loading: true })

    fetchDataFromAPI(settings, (err, repositories, rateLimit) => {
      if (err) return this.handleErrorMessage(err)

      this.setState({ repositories, rateLimit, loading: false })

      // Save repository to storage for faster reloads
      chrome.storage.local.set({ repositories, rateLimit })
    })
  }

  handleShowSettings = (e) => {
    e.preventDefault()
    this.setState({ showSettings: !this.state.showSettings })
  }

  handleSaveSettings = (settings) => {
    this.setState({ settings, showSettings: !this.state.showSettings })

    chrome.storage.local.set({ settings })
  }

  handleClearErrors = () => {
    this.setState({ errors: [] })
  }

  handleErrorMessage = (errMsg) => {
    this.setState(prevState => ({
      errors: [...prevState.errors, ...errMsg],
      loading: false
    }))
  }

  render () {
    const { showSettings, settings } = this.state

    if (!settings) return null

    return (
      <div className='sidebar'>
        <Header
          showSettings={this.handleShowSettings}
          loading={this.state.loading}
          errors={this.state.errors}
          clearErrors={this.handleClearErrors}
        />

        {showSettings
          ? (
            <Settings
              rateLimit={this.state.rateLimit}
              settings={this.state.settings}
              saveSettings={this.handleSaveSettings}
            />
          ) : (
            <Repositories
              repositories={this.state.repositories}
              type={this.state.settings.listItemOfType}
            />
          )
        }
      </div>
    )
  }
}

const id = 'github-sidebar'
if (!document.getElementById(id)) {
  const appendDiv = document.createElement('div')
  appendDiv.id = id
  document.body.appendChild(appendDiv)
}

ReactDOM.render(<App />, document.getElementById(id))
