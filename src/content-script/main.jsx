/* global chrome */

import React from 'react'
import ReactDOM from 'react-dom'

import './css/index.scss'

//* ********* React components **********/
import Header from './components/Header/index.jsx'
import Repositories from './components/Repositories/index.jsx'
import Settings from './components/Settings/index.jsx'
import Splash from './components/Splash/index.jsx'

class App extends React.Component {
  constructor () {
    super()

    this.state = {
      repositories: [],
      errors: [],
      rateLimit: undefined,
      showSettings: false,
      settings: undefined,
      loading: false
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
    if (e) e.preventDefault()
    this.setState({ showSettings: !this.state.showSettings })
  }

  render () {
    const { showSettings, settings } = this.state

    if (!settings) return null
    if (!settings.token) return <Splash />

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
            />
          ) : (
            <Repositories
              repositories={this.state.repositories}
              type={this.state.settings.listItemOfType}
              settings={settings}
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
