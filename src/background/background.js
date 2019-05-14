/* global chrome */

import defaultSettings from './js/defaultSettings.json'
import {
  fetchDataFromAPI
} from './js/fetch.js'

// Uncomment this to erase chrome storage for developent
// chrome.storage.local.clear(function () {
//   const error = chrome.runtime.lastError
//   if (error) console.error(error)
// });

let errors = []
let quickStorage = {
  settings: undefined,
  repositories: undefined,
  rateLimit: undefined,
  getStorage: function (_callback) {
    // If we already have some data to return
    if (this.settings) {
      return _callback({
        settings: this.settings,
        repositories: this.repositories,
        rateLimit: this.rateLimit
      })
    }

    chrome.storage.local.get(['settings', 'repositories', 'rateLimit'],
      ({ settings, repositories, rateLimit }) => {
        // merges default settings and user settings
        this.settings = { ...defaultSettings, ...settings }

        this.repositories = repositories
        this.rateLimit = rateLimit

        // Always fetch when we first load settings
        fetchData()
        autoFetch.start(this.settings.autoRefresh)

        _callback({
          settings,
          repositories,
          rateLimit
        })
      })
  }
}

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

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.type) {
    case 'init':
      quickStorage.getStorage(({ settings, repositories, rateLimit }) => {
        sendResponse({ settings, repositories, rateLimit })

        // Each time we have a init, the user has navigated, we do a new fetch
        fetchData()

        // If autofetching is not running, we will start it up again
        if (!autoFetch.timer) autoFetch.start(settings.autoRefresh)
      })

      // Return true to allow async return of sendResponse
      return true

    case 'toggleRead':
      quickStorage.repositories = quickStorage.repositories.map(repo => {
        const match = repo.items.find(item => item.id === request.id)
        if (match) match.read = !match.read

        return repo
      })

      sendToAllTabs({
        repositories: quickStorage.repositories
      })

      // Save repos to storage
      chrome.storage.local.set({
        repositories: quickStorage.repositories
      })
      break

    case 'saveSettings':
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
      break

    case 'clearErrors':
      errors = []
      sendToAllTabs({ errors })
      break
  }
})

// We update the read-status of items based on visited urls
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.url && changeInfo.url.indexOf('github.com') !== -1) {
    const repositories = setUrlAsRead(changeInfo.url)

    quickStorage.repositories = repositories
    sendToAllTabs({ repositories })
  }
})

function sendToAllTabs (data) {
  chrome.tabs.query({ url: '*://*.github.com/*' }, (tabs) => {
    // If there no longer are any tabs, we stop autofetching to let this script unload
    if (tabs.length === 0) return autoFetch.stop()

    tabs.forEach(tab => {
      chrome.tabs.sendMessage(tab.id, data)
    })
  })
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
