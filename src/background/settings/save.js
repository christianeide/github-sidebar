import { quickStorage, defaultSettings } from './index';
import { autoFetch } from '../background.js';
import { sendToAllTabs } from '../lib/';
import { fetchData } from '../api/';

const MIMIMUMREFRESHPERIOD = 15;

export function saveSettings(newSettings) {
	// If refreshperiod has changed and is more than minimum val
	if (
		newSettings.autoRefresh &&
		newSettings.autoRefresh >= MIMIMUMREFRESHPERIOD &&
		quickStorage.settings.autoRefresh !== newSettings.autoRefresh
	) {
		autoFetch.change(newSettings.autoRefresh);
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
