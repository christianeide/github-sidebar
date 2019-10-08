/* global chrome */

import React from 'react'
import ReactDOM from 'react-dom'
import './css/index.scss'

//* ********* React components **********/
import Header from './components/Header/index.jsx'
import Repositories from './components/Repositories/index.jsx'
import Settings from './components/Settings/index.jsx'
import Splash from './components/Splash/index.jsx'
import setBadge, { hasUnreadItems } from './js/setBadge'

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

    this.port = chrome.runtime.connect()
    this.listenToBackground = null
  }

  componentDidMount () {
    // Get preloaded data
    this.port.postMessage({ type: 'init' })
    // Set up listener for new messages
    this.listenToBackground = this.port.onMessage.addListener((newState) => {
      this.setState({ ...newState })
    })
  }

  componentDidUpdate (prevProps, prevState) {
    setBadge(this.state.repositories, this.showFavicon())
  }

  showFavicon () {
    return this.state.settings && this.state.settings.updateFavicon
  }

  componentWillUnmount () {
    this.port.onMessage.removeListener(this.listenToBackground)
  }

  handleToggleSettings = (e) => {
    if (e) e.preventDefault()
    this.setState({ showSettings: !this.state.showSettings })
  }

  render () {
    const {
      showSettings,
      settings,
      loading,
      errors,
      rateLimit,
      repositories
    } = this.state

    if (!settings) return null
    if (!settings.token) return <Splash port={this.port} />

    return (
      <div className={`sidebar ${settings.theme}`}>
        <Header
          toggleSettings={this.handleToggleSettings}
          loading={loading}
          errors={errors}
          showSettings={showSettings}
          port={this.port}
          hasUnread={hasUnreadItems(repositories)}
          showBadge={this.showFavicon()}
        />

        {showSettings
          ? (
            <Settings
              rateLimit={rateLimit}
              settings={settings}
              port={this.port}
            />
          ) : (
            <Repositories
              repositories={repositories}
              settings={settings}
              toggleSettings={this.handleToggleSettings}
              port={this.port}
            />
          )}
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
