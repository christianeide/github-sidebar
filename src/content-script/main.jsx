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
      rateLimit: null,
      showSettings: false,
      settings: {
        token: null,
        autoUpdate: true,
        updateEach: 30,
        listItemOfType: 'pullRequest',
        numberOfItems: 5,
        updateFavicon: true,
        viewportSide: 'left',
        repos: [
          {
            name: 'nora-core',
            owner: 'nrkno'
          },
          {
            name: 'nora-module-browser',
            owner: 'nrkno'
          },
          {
            name: 'nora-render-nyheter',
            owner: 'nrkno'
          }
        ]
      }
    }
  }

  componentDidMount () {
    chrome.storage.local.get(['settings', 'repositories', 'rateLimit'], result => {
      this.setState(state => {
        // merges default settings ond user settings
        // TODO: remove this when settings is complete
        const { settings: settingsRaw, ...data } = result
        const settings = { ...state.settings, ...settingsRaw }

        return { settings, ...data }
      })
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
    const { showSettings } = this.state

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
