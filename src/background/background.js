/* global chrome */

import defaultSettings from './js/defaultSettings.json'
import { fetchDataFromAPI } from './js/fetch.js'
import * as ports from './js/ports'
import { quickStorage } from './js/quickStorage'

// Uncomment this to erase chrome storage for developent
// chrome.storage.local.clear(function () {
//   const error = chrome.runtime.lastError
//   if (error) console.error(error)
// });

let errors = []
let autoFetch = {
  timer: undefined,
  cb: fetchData,
  start: function (interval) {
    this.timer = setInterval(this.cb, this.calculateMS(interval))
  },
  stop: function () {
    if (!this.timer) return
    clearInterval(this.timer)
    this.timer = undefined
  },
  change: function (interval) {
    if (!this.timer) return
    clearInterval(this.timer)
    this.timer = setInterval(this.cb, this.calculateMS(interval))
  },
  calculateMS: function (min) {
    return min * 1000
  }
}

// We update the read-status of items based on visited urls
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.url && changeInfo.url.indexOf('github.com') !== -1) {
    const repositories = setUrlAsRead(changeInfo.url)

    quickStorage.repositories = repositories
    sendToAllTabs({ repositories })
  }
})

// Most of communication happes on this event
chrome.runtime.onConnect.addListener(port => {
  port.onMessage.addListener(request => {
    switch (request.type) {
      case 'init':
        init(port)
        break

      case 'toggleRead':
        toggleRead(request)
        break

      case 'saveSettings':
        saveSettings(request)
        break

      case 'clearErrors':
        errors = []
        sendToAllTabs({ errors })
        break
    }
  })
})

function init (port) {
  quickStorage.getStorage(({ settings, repositories, rateLimit }) => {
    // Return initial data
    port.postMessage({
      settings,
      repositories,
      rateLimit
    })

    // Always fetch new data when we have a init from a new contentscript
    fetchData()

    // If autofetching is not running, we will start it up again
    if (!autoFetch.timer) autoFetch.start(settings.autoRefresh)

    // Add port to portmanagment
    ports.add(port)
  })
}

function toggleRead (request) {
  quickStorage.repositories = quickStorage.repositories.map(repo => {
    const match = repo.items.find(item => item.id === request.id)
    if (match) { match.read = !match.read }
    return repo
  })

  sendToAllTabs({ repositories: quickStorage.repositories })

  // Save repos to storage
  chrome.storage.local.set({ repositories: quickStorage.repositories })
}

function saveSettings (request) {
  // If refreshperiod has changed
  if (request.settings.autoRefresh &&
    quickStorage.settings.autoRefresh !== request.settings.autoRefresh) {
    autoFetch.change(request.settings.autoRefresh)
  }

  const settings = { ...defaultSettings, ...request.settings }
  quickStorage.settings = settings

  // Save settings to storage
  chrome.storage.local.set({ settings })

  // If we have repos, we will always hide settings
  const showSettings = settings.repos.length === 0

  // Distribute settings to all tabs
  sendToAllTabs({ settings, showSettings })

  // Do a new fetch when we have new settings
  fetchData()
}

function sendToAllTabs (data) {
  ports.messageAll(data)
}

function fetchData () {
  const { settings } = quickStorage

  if (!settings || !settings.token) return

  // Show loadinganimation when we are fetching data
  sendToAllTabs({ loading: true })

  fetchDataFromAPI(settings, (err, newRepoData, rateLimit) => {
    if (err) {
      errors.push(...err)
      return sendToAllTabs({ errors, loading: false })
    }

    // Transfer read-status from old repositories
    const repositories = transferReadStatus(newRepoData)

    quickStorage.repositories = repositories
    quickStorage.rateLimit = rateLimit

    sendToAllTabs({
      repositories,
      rateLimit,
      loading: false
    })

    // Save repositorydata to storage for faster reloads
    chrome.storage.local.set({
      repositories,
      rateLimit
    })
  })
}

function transferReadStatus (repositories) {
  return repositories.map(repo => {
    repo.items.map(item => {
      quickStorage.repositories.map(oldRepo => {
        oldRepo.items.map(i => {
          if (i.id === item.id) item.read = i.read
        })
      })
      return item
    })
    return repo
  })
}

function setUrlAsRead (url) {
  return quickStorage.repositories.map(repo => {
    repo.items.map(item => {
      if (item.url === url) item.read = true
      return item
    })
    return repo
  })
}
