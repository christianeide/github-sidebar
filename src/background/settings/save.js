import { quickStorage, defaultSettings } from './index';
import { setAlarm } from '../background.js';
import { ports } from '../lib/';
import { fetchData } from '../api/';

const MIMIMUMREFRESHPERIOD = 15;

export function saveSettings(newSettings) {
	// If refreshperiod has changed and is more than minimum val
	if (
		newSettings.autoRefresh &&
		newSettings.autoRefresh >= MIMIMUMREFRESHPERIOD &&
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
	ports.sendToAllTabs({
		settings,
	});

	// Do a new fetch when we have new settings
	fetchData();
}
