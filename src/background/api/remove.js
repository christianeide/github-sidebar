import { ports } from '../lib/';
import { quickStorage } from '../settings/';
import { fetchData } from './index.js';

// removes a repo by its index-value
export function autoRemoveRepo(repoNr) {
	const settings = quickStorage.settings;

	const repos = settings.repos.filter((value, index) => index !== repoNr);

	const newSettings = {
		...settings,
		repos,
	};

	// Distribute settings to all tabs
	quickStorage.settings = newSettings;
	ports.sendToAllTabs({
		settings: newSettings,
	});

	// Do a new fetch when we have new settings
	fetchData();
}
