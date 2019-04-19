/* global chrome */

import React from 'react'
import ReactDOM from 'react-dom'

import './css/index.scss'

//* ********* React components **********/
import Header from './components/Header/index.jsx'
import Repositories from './components/Repositories/index.jsx'
import Settings from './components/Settings/index.jsx'

class App extends React.Component {
  constructor () {
    super()

    this.state = {
      repositories: [],
      rateLimit: undefined,
      showSettings: false,
      settings: undefined,
      loading: false,
      errors: []
    }

    this.listenToBackground = null
  }

  componentDidMount () {
    // Get preloaded data
    chrome.runtime.sendMessage({ type: 'init' }, initialState => {
      this.setState({ ...initialState })
    })

    this.listenToBackground = chrome.runtime.onMessage.addListener(this.receiveFromBackground)
  }

  componentWillUnmount () {
    clearInterval(this.listenToBackground)
  }

  receiveFromBackground = (newState) => {
    this.setState({ ...newState })
  }

  handleShowSettings = (e) => {
    e.preventDefault()
    this.setState({ showSettings: !this.state.showSettings })
  }

  handleSaveSettings = (settings) => {
    this.setState({ showSettings: !this.state.showSettings })

    chrome.runtime.sendMessage({ type: 'saveSettings', settings })
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
