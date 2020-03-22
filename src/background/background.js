/* global chrome */

import defaultSettings from './js/defaultSettings.json';
import { fetchDataFromAPI } from './js/fetch.js';
import * as ports from './js/ports';
import { quickStorage } from './js/quickStorage';

// Uncomment this to erase chrome storage for developent
// chrome.storage.local.clear(function () {
//   const error = chrome.runtime.lastError
//   if (error) console.error(error)
// })

let errors = [];
const autoFetch = {
	timer: undefined,
	cb: fetchData,
	start: function(interval) {
		this.timer = setInterval(this.cb, this.calculateMS(interval));
	},
	stop: function() {
		if (!this.timer) {
			return;
		}
		clearInterval(this.timer);
		this.timer = undefined;
	},
	change: function(interval) {
		if (!this.timer) {
			return;
		}
		clearInterval(this.timer);
		this.timer = setInterval(this.cb, this.calculateMS(interval));
	},
	calculateMS: function(min) {
		return min * 1000;
	}
};

// We update the read-status of items based on visited urls
chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
	if (changeInfo.url && changeInfo.url.indexOf('github.com') !== -1) {
		setRepoAsReadByURL(changeInfo.url);

		sendToAllTabs({
			repositories: quickStorage.repositories
		});
	}
});

// Most of communication happes on this event
chrome.runtime.onConnect.addListener((port) => {
	port.onMessage.addListener((request) => {
		switch (request.type) {
			case 'init':
				init(port);
				break;

			case 'toggleRead':
				toggleRead(request);
				break;

			case 'toggleCollapsed':
				toggleCollapsed(request);
				break;

			case 'saveSettings':
				saveSettings(request);
				break;

			case 'clearErrors':
				errors = [];
				sendToAllTabs({
					errors
				});
				break;
		}
	});
});

function init(port) {
	quickStorage.getStorage(({ settings, repositories, rateLimit }) => {
		// Return initial data
		port.postMessage({
			settings,
			repositories,
			rateLimit
		});

		// Always fetch new data when we have a init from a new contentscript
		fetchData();

		// If autofetching is not running, we will start it up again
		if (!autoFetch.timer) {
			autoFetch.start(settings.autoRefresh);
		}

		// Add port to portmanagment
		ports.add(port);
	});
}

function toggleRead(request) {
	quickStorage.repositories.forEach((repo) => {
		setArrayItem(repo.issues, repo.url);
		setArrayItem(repo.pullRequests, repo.url);
	});

	sendToAllTabs({
		repositories: quickStorage.repositories
	});

	// Save repos to storage
	chrome.storage.local.set({
		repositories: quickStorage.repositories
	});

	function setArrayItem(type, repo) {
		type.forEach((item) => {
			// If single item
			if (request.id) {
				if (item.id === request.id) {
					item.read = !item.read;
				}

				// If repo
			} else if (request.repo) {
				if (repo === request.repo) {
					item.read = request.status;
				}

				// if all
			} else {
				item.read = true;
			}
		});
	}
}

function toggleCollapsed(request) {
	quickStorage.repositories.forEach((repo) => {
		if (repo.url === request.url) {
			repo.collapsed = !repo.collapsed;
		}
	});

	sendToAllTabs({
		repositories: quickStorage.repositories
	});

	// Save repos to storage
	chrome.storage.local.set({
		repositories: quickStorage.repositories
	});
}

function saveSettings(request) {
	// If refreshperiod has changed and is more than minimum val
	if (
		request.settings.autoRefresh &&
		quickStorage.settings.autoRefresh !== request.settings.autoRefresh &&
		request.settings.autoRefresh >= 15
	) {
		autoFetch.change(request.settings.autoRefresh);
	}

	const settings = {
		...defaultSettings,
		...request.settings
	};
	quickStorage.settings = settings;

	// Save settings to storage
	chrome.storage.local.set({
		settings
	});

	// Distribute settings to all tabs
	sendToAllTabs({
		settings
	});

	// Do a new fetch when we have new settings
	fetchData();
}

function sendToAllTabs(data) {
	ports.messageAll(data);
}

function fetchData() {
	const { settings } = quickStorage;

	if (!settings || !settings.token) {
		return;
	}

	// Show loadinganimation when we are fetching data
	sendToAllTabs({
		loading: true
	});

	fetchDataFromAPI(settings, (err, newRepoData, rateLimit) => {
		if (err) {
			errors.push(...err);
			return sendToAllTabs({
				errors,
				loading: false
			});
		}
		// Transfer read-status from old repositories
		const repositories = transferUserStatus(newRepoData);

		quickStorage.repositories = repositories;
		quickStorage.rateLimit = rateLimit;

		sendToAllTabs({
			repositories,
			rateLimit,
			loading: false
		});

		// Save repositorydata to storage for faster reloads
		chrome.storage.local.set({
			repositories,
			rateLimit
		});
	});
}

function transferUserStatus(repositories) {
	return repositories.map((repo) => {
		// Copy collapsed status
		quickStorage.repositories.map((oldRepo) => {
			if (repo.url === oldRepo.url) {
				repo.collapsed = oldRepo.collapsed;
			}
		});

		const issues = tranferStatusOfItem(repo, 'issues');
		const pullRequests = tranferStatusOfItem(repo, 'pullRequests');
		return {
			...issues,
			...pullRequests
		};
	});

	function tranferStatusOfItem(repo, type) {
		repo[type].map((item) => {
			quickStorage.repositories.map((oldRepo) => {
				if (oldRepo[type]) {
					oldRepo[type].map((i) => {
						if (i.id === item.id) {
							item.read = i.read;
						}
					});
				}
			});
			return item;
		});
		return repo;
	}
}

function setRepoAsReadByURL(url) {
	quickStorage.repositories.forEach((repo) => {
		setArrayItem(repo.issues);
		setArrayItem(repo.pullRequests);
	});

	function setArrayItem(type) {
		type.forEach((item) => {
			if (item.url === url) {
				item.read = true;
			}
		});
	}
}

export function autoRemoveRepo(repoNr) {
	const settings = quickStorage.settings;

	settings.repos = settings.repos.filter(function(value, index) {
		return index !== repoNr;
	});

	// Save settings to storage
	chrome.storage.local.set({
		settings
	});

	// Distribute settings to all tabs
	sendToAllTabs({
		settings
	});

	// Do a new fetch when we have new settings
	fetchData();
}
