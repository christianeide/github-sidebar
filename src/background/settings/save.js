import { quickStorage, defaultSettings } from './index';
import { setAlarm } from '../background.js';
import { sendToAllTabs } from '../lib/';
import { fetchData } from '../api/';
import { MINIMUMREFRESHPERIOD } from '../../common';

export function saveSettings(newSettings) {
	// If refreshperiod has changed and is more than minimum val
	if (
		newSettings.autoRefresh &&
		newSettings.autoRefresh >= MINIMUMREFRESHPERIOD &&
		quickStorage.settings.autoRefresh !== newSettings.autoRefresh
	) {
		setAlarm.change(newSettings.autoRefresh);
	}

	const settings = {
		...defaultSettings,
		...newSettings,
	};

	// Distribute settings to all tabs
	quickStorage.settings = settings;
	sendToAllTabs({
		settings,
	});

	// Do a new fetch when we have new settings
	fetchData();
}
