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

export const setAlarm = {
	isRunning: false,
	timerName: 'autoFetch',

	start(interval) {
		console.log('start interval');
		chrome.alarms.create(this.timerName, { periodInMinutes: 1 }); // TODO: Use user-interval in seconds
		// this.timer = setInterval(this.cb, this.calculateMS(interval));

		this.isRunning = true;
	},

	stop() {
		if (!this.isRunning) {
			return;
		}
		chrome.alarms.clear(this.timerName);
		this.isRunning = false;
	},

	change(interval) {
		if (!this.isRunning) {
			return;
		}
		chrome.alarms.create(this.timerName, { periodInMinutes: 1 }); // TODO: Intervla

		// this.timer = setInterval(this.cb, this.calculateMS(interval));
	},

	calculateMS(min) {
		return min * 1000;
	},

	alarmTick() {
		fetchData();
	},
};

chrome.alarms.onAlarm.addListener(setAlarm.alarmTick);

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
