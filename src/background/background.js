import { quickStorage, saveSettings } from './settings/';
import {
	init,
	toggleRead,
	toggleCollapsed,
	setItemInRepoAsReadBasedOnUrl,
	ports,
} from './lib/';
import { fetchData, apiErrors } from './api/';

// Uncomment this to erase chrome storage for developent
// chrome.storage.local.clear(function () {
// 	const error = chrome.runtime.lastError;
// 	if (error) {
// 		console.error(error);
// 	}
// });

export const autoFetch = {
	timer: undefined,
	cb: fetchData,

	start(interval) {
		this.timer = setInterval(this.cb, this.calculateMS(interval));
	},

	stop() {
		if (!this.timer) {
			return;
		}
		clearInterval(this.timer);
		this.timer = undefined;
	},

	change(interval) {
		if (!this.timer) {
			return;
		}
		clearInterval(this.timer);
		this.timer = setInterval(this.cb, this.calculateMS(interval));
	},

	calculateMS(min) {
		return min * 1000;
	},
};

// Most communication happens on this event
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
				saveSettings(request.settings);
				break;

			case 'clearErrors':
				apiErrors.set([]);
				ports.sendToAllTabs({
					errors: apiErrors.get(),
				});
				break;
		}
	});
});

// We update the read-status of items based on visited urls
chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
	const newRepositoriesData = setItemInRepoAsReadBasedOnUrl(changeInfo.url);

	if (newRepositoriesData) {
		// save and distribute
		quickStorage.repositories = newRepositoriesData;
		ports.sendToAllTabs({
			repositories: newRepositoriesData,
		});
	}
});
