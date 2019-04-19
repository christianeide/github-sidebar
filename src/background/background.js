/* global chrome */
import defaultSettings from './defaultSettings.json'

let refreshTimer = null
let settings
let repositories
let rateLimit
let showSettings

(function getInitialLocalStorage () {
  chrome.storage.local.get(['settings', 'repositories', 'rateLimit'],
    (storageData) => {
      console.log(storageData)
      // merges default settings and user settings
      settings = { ...defaultSettings, ...storageData.settings }

      showSettings = !settings.token
      repositories = storageData.repositories
      rateLimit = storageData.rateLimit
    })
})()

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'init') {
    sendResponse({ settings, showSettings, repositories, rateLimit })
  } else if (request.type === 'saveSettings') {
    // Update main settings
    settings = request.settings

    // Save settings to storage
    chrome.storage.local.set({ settings })

    // Distribute settings to all tabs
    sendToAllTabs({ type: 'settings', settings })
  }
})

function sendToAllTabs (data) {
  chrome.tabs.query({ url: '*://*.github.com/*' }, tabs => {
    tabs.forEach(tab => {
      chrome.tabs.sendMessage(tab.id, data)
    })
  })
}

refreshTimer = setInterval(() => {
  // sendToAllTabs()
}, 15000)
