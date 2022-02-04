import { sendToAllTabs } from '../lib/communication';
import { quickStorage } from '../settings/';
import { fetchData } from './index.js';

// removes a repo by its index-value
export async function autoRemoveRepo(repoNr) {
	const settings = await quickStorage.getSettings();

	const repos = settings.repos.filter((value, index) => index !== repoNr);

	const newSettings = {
		...settings,
		repos,
	};

	// Distribute settings to all tabs
	quickStorage.setSettings(newSettings);
	sendToAllTabs({
		settings: newSettings,
	});

	// Do a new fetch when we have new settings
	fetchData();
}
