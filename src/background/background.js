import { saveSettings } from './settings/';
import {
	init,
	toggleRead,
	toggleCollapsed,
	handleBrowserNavigation,
} from './lib/';
import { sendToAllTabs } from './lib/communication';
import { fetchData, apiErrors } from './api/';
import { convertMsToSec } from '../common';

// Uncomment this to erase chrome storage for developent
// chrome.storage.local.clear(function () {
// 	const error = chrome.runtime.lastError;
// 	if (error) {
// 		console.error(error);
// 	}

// chrome.alarms.clearAll();
// });

export const setAlarm = {
	timerName: 'autoFetch',

	isRunning(cb) {
		return chrome.alarms.get(this.timerName, cb);
	},

	start(interval) {
		this.isRunning((activeAlarm) => {
			if (activeAlarm) {
				return;
			}

			chrome.alarms.create(this.timerName, {
				periodInMinutes: convertMsToSec(interval),
			});
		});
	},

	stop() {
		this.isRunning((activeAlarm) => {
			if (!activeAlarm) {
				return;
			}

			chrome.alarms.clear(this.timerName);
		});
	},

	change(interval) {
		this.isRunning((activeAlarm) => {
			if (!activeAlarm) {
				return;
			}

			chrome.alarms.create(this.timerName, {
				periodInMinutes: convertMsToSec(interval),
			});
		});
	},

	alarmTick() {
		fetchData();
	},
};

//Setup listener for alarm/interval ticks
chrome.alarms.onAlarm.addListener(setAlarm.alarmTick);

// Most communication happens on this event
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	switch (request.type) {
		case 'init':
			init(sendResponse);

			return true;

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
			sendToAllTabs({
				errors: apiErrors.get(),
			});
			break;
	}
});

// We update the read-status of items based on visited urls
chrome.tabs.onUpdated.addListener(handleBrowserNavigation);
