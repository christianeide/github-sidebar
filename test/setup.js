import {
	createQuickStorage,
	createRepositoryData,
	mockFetchResolve,
} from './generate.js';
import { quickStorage } from '../src/background/settings/quickStorage.js';
import { apiErrors } from '../src/background/api/index.js';

export async function setupBackgroundTests(options) {
	mockFetchResolve(createRepositoryData().external);

	// Before each test we calll getStoragge() and do a basic setup
	// This will get data from storage, so we mock the return data
	// At the same time we mock the return data from fetch as well.
	// Finally we clear any calls theese mocks have received
	chrome.storage.local.get.mockImplementation((message, callback) => {
		callback(createQuickStorage(options));
	});

	// Do a initial setup for storage
	quickStorage.settings = undefined;
	quickStorage.repositories = undefined;
	quickStorage.rateLimit = undefined;
	await quickStorage.getStorage();
	chrome.storage.local.set.mockClear();

	// Clear errors inbetween each test
	apiErrors.set([]);
}
