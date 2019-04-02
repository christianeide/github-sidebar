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
      settings: null
    }
  }

  componentDidMount () {
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

        this.setState({ settings, showSettings, ...data })
      })

    // this.interval = setInterval(() => {
    //   this.fetchData()
    // }, 30000)
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
    fetchDataFromAPI(settings, (repositories, rateLimit) => {
      if (repositories && rateLimit) {
        this.setState({ repositories, rateLimit })

        // Save repository to storage for faster reloads
        chrome.storage.local.set({ repositories, rateLimit })
      }
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

  render () {
    const { showSettings, settings } = this.state

    if (!settings) return null

    return (
      <div className='sidebar'>
        <Header showSettings={this.handleShowSettings} />

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
