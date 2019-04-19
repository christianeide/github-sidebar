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

class App extends React.Component {
  constructor () {
    super()

    this.state = {
      repositories: [],
      rateLimit: undefined,
      showSettings: false,
      settings: undefined,
      loading: undefined,
      errors: []
    }

    this.listenToBackground = null
  }

  componentDidMount () {
    // Uncomment this to erase chrome storage for developent
    // chrome.storage.local.clear(function () {
    //   const error = chrome.runtime.lastError
    //   if (error) console.error(error)
    // })

    // Get preloaded data
    chrome.runtime.sendMessage({ type: 'init' }, initialState => {
      this.setState({ ...initialState })
    })

    this.listenToBackground = chrome.runtime.onMessage.addListener(this.receiveFromBackground)
  }

  componentDidUpdate (prevProps, prevState, snapshot) {
    if (this.state.settings !== prevState.settings) {
      this.fetchData(this.state.settings)
    }
  }

  componentWillUnmount () {
    clearInterval(this.listenToBackground)
  }

  receiveFromBackground = (data) => {
    console.log(data)

    const { type, ...newState } = data
    this.setState({ ...newState })
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
    this.setState({ showSettings: !this.state.showSettings })

    chrome.runtime.sendMessage({ type: 'saveSettings', settings })
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
