import {
	createQuickStorage,
	createRepositoryData,
	mockFetchResolve,
} from './generate.js';
import { quickStorage } from '../src/background/settings/';
import { apiErrors } from '../src/background/api/';

export async function setupBackgroundTests(options) {
	mockFetchResolve(createRepositoryData().external);

	// Before each test we calll getStorage() and do a basic setup
	// This will get data from storage, so we mock the return data
	// At the same time we mock the return data from fetch as well.
	// Finally we clear any calls theese mocks have received
	setupChromeStorage(options);

	// Do a initial setup for storage
	await resetQuickStorage();

	// Clear errors inbetween each test
	apiErrors.set([]);
}

export function setupChromeStorage(options) {
	chrome.storage.local.get.mockImplementation((message, callback) => {
		callback(createQuickStorage(options));
	});
}

export async function resetQuickStorage() {
	quickStorage.setSettings(undefined);
	quickStorage.setRepositories(undefined);
	quickStorage.setRateLimit(undefined);
	await quickStorage.getStorage();
	chrome.storage.local.set.mockClear();
}
