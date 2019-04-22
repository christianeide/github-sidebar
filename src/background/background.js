/* global chrome */

import defaultSettings from './js/defaultSettings.json'
import { fetchDataFromAPI } from './js/fetch.js'

let errors = []
let settings
let repositories
let rateLimit

// Uncomment this to erase chrome storage for developent
// chrome.storage.local.clear(function () {
//   const error = chrome.runtime.lastError
//   if (error) console.error(error)
// });

(function getInitialLocalStorage () {
  chrome.storage.local.get(['settings', 'repositories', 'rateLimit'],
    (storageData) => {
      // merges default settings and user settings
      settings = { ...defaultSettings, ...storageData.settings }

      repositories = storageData.repositories
      rateLimit = storageData.rateLimit

      // Always fetch on startup
      fetchData()

      autoFetch.start(settings.autoRefresh)
    })
})()

let autoFetch = {
  timer: undefined,
  cb: fetchData,
  start: (interval) => {
    autoFetch.timer = setInterval(autoFetch.cb, autoFetch.calculateMS(interval))
  },
  stop: () => {
    if (!autoFetch.timer) return
    clearInterval(autoFetch.timer)
    autoFetch.timer = undefined
  },
  change: (interval) => {
    if (!autoFetch.timer) return
    clearInterval(autoFetch.timer)
    setInterval(autoFetch.cb, autoFetch.calculateMS(interval))
  },
  calculateMS: (min) => {
    // return min * 60 * 1000
    return min * 1000
  }
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.type) {
    case 'init':
      sendResponse({ settings, repositories, rateLimit })

      // If autofetching is not running, we will start it up again
      if (!autoFetch.timer) autoFetch.start(settings.autoRefresh)
      break

    case 'saveSettings':
      // If refreshperiod has changed
      if (request.settings.autoRefresh &&
        settings.autoRefresh !== request.settings.autoRefresh) {
        autoFetch.change(request.settings.autoRefresh)
      }

      // Update main settings
      settings = { ...defaultSettings, ...request.settings }

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

function sendToAllTabs (data) {
  console.log('send to all tabs')
  chrome.tabs.query({ url: '*://*.github.com/*' }, (tabs) => {
    // If there no longer are any tabs, we stop autofetching to let this script unload
    if (tabs.length === 0) return autoFetch.stop()

    tabs.forEach(tab => {
      chrome.tabs.sendMessage(tab.id, data)
    })
  })
}

function fetchData () {
  console.log('fetchdata')
  if (!settings.token) return

  // Show loadinganimation when we are fetching data
  sendToAllTabs({ loading: true })

  fetchDataFromAPI(settings, (err, newRepositories, newRateLimit) => {
    if (err) {
      errors.push(...err)
      return sendToAllTabs({ errors, loading: false })
    }

    repositories = newRepositories
    rateLimit = newRateLimit

    sendToAllTabs({ repositories, rateLimit, loading: false })

    // Save repositorydata to storage for faster reloads
    chrome.storage.local.set({ repositories, rateLimit })
  })
}
