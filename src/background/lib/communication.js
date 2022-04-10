import { setAlarm } from '../background';

export function sendToAllTabs(message) {
	chrome.tabs.query({ url: 'https://github.com/*' }, (tabs) => {
		// If we dont have any tabs and by that any content script,
		// then we will stop the interval
		if (!tabs || tabs.length === 0) {
			return setAlarm.stop();
		}

		tabs.map((tab) => {
			chrome.tabs.sendMessage(tab.id, message).catch(() => {}); // Catch if we cant send to the tab
		});
	});
}
