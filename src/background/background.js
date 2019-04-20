/* global chrome */

import defaultSettings from './js/defaultSettings.json'
import { fetchDataFromAPI } from './js/fetch.js'

let errors = []
let settings
let repositories
let rateLimit
let showSettings

// Uncomment this to erase chrome storage for developent
// chrome.storage.local.clear(function () {
//   const error = chrome.runtime.lastError
//   if (error) console.error(error)
// })

(function getInitialLocalStorage () {
  chrome.storage.local.get(['settings', 'repositories', 'rateLimit'],
    (storageData) => {
      // merges default settings and user settings
      settings = { ...defaultSettings, ...storageData.settings }

      showSettings = !settings.token
      repositories = storageData.repositories
      rateLimit = storageData.rateLimit

      // Always fetch on startup
      fetchData()

      autoFetch.start(fetchData, settings.autoRefresh)
    })
})()

let autoFetch = {
  timer: undefined,
  cb: undefined,
  start: (cb, interval) => {
    autoFetch.timer = setInterval(cb, autoFetch.calculateMS(interval))
    autoFetch.cb = cb
  },
  stop: () => {
    if (!autoFetch.timer) return
    clearInterval(autoFetch.timer)
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
      sendResponse({ settings, showSettings, repositories, rateLimit })
      break

    case 'saveSettings':
      // If refreshperiod has changed
      if (settings.autoRefresh !== request.settings.autoRefresh) autoFetch.change(request.settings.autoRefresh)

      // Update main settings
      settings = request.settings
      // Save settings to storage
      chrome.storage.local.set({ settings })
      // Distribute settings to all tabs
      sendToAllTabs({ settings })

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
  chrome.tabs.query({ url: '*://*.github.com/*' }, tabs => {
    tabs.forEach(tab => {
      chrome.tabs.sendMessage(tab.id, data)
    })
  })
}

function fetchData () {
  if (!settings.token) return

  // Show loadinganimation when we are fetching data
  sendToAllTabs({ loading: true })

  fetchDataFromAPI(settings, (err, repositories, rateLimit) => {
    if (err) {
      errors.push(...err)
      return sendToAllTabs({ errors, loading: false })
    }

    sendToAllTabs({ repositories, rateLimit, loading: false })

    // Save repositorydata to storage for faster reloads
    chrome.storage.local.set({ repositories, rateLimit })
  })
}
