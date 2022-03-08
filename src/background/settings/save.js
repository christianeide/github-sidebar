import { quickStorage, defaultSettings } from './index';
import { setAlarm } from '../background.js';
import { sendToAllTabs } from '../lib/communication';
import { fetchData } from '../api/';
import { MINIMUMREFRESHPERIOD } from '../../common';

export async function saveSettings(newSettings) {
	const currrentSettings = await quickStorage.getSettings();

	// Stop alarm if no token
	if (!newSettings.token) {
		setAlarm.stop();

		// Start alarm if token has changed
	} else if (currrentSettings.token !== newSettings.token) {
		setAlarm.start(newSettings.autoRefresh);

		// Change alarm time if refreshperiod has changed and is more than minimum val
	} else if (
		newSettings.autoRefresh &&
		newSettings.autoRefresh >= MINIMUMREFRESHPERIOD &&
		currrentSettings.autoRefresh !== newSettings.autoRefresh
	) {
		setAlarm.change(newSettings.autoRefresh);
	}

	const settings = {
		...defaultSettings,
		...newSettings,
	};

	// Distribute settings to all tabs
	quickStorage.setSettings(settings);
	sendToAllTabs({
		settings,
	});

	// Do a new fetch when we have new settings
	fetchData();
}
