import { autoRemoveRepo } from '../remove.js';
import { quickStorage } from '../../settings/quickStorage.js';
import * as ports from '../../lib/ports';
jest.mock('../../lib/ports');
import { fetchData } from '../index';
jest.mock('../index');

import { createQuickStorage } from '../../../../test/generate.js';

beforeEach(async () => {
	// TODO: Do this in generate-file? Or new setup-file?

	// Before each test we calll getStoragge() and do a basic setup
	// This will get data from storage, so we mock the return data
	// At the same time we mock the return data from fetch as well.
	// Finally we clear any calls theese mocks have received
	chrome.storage.local.get.mockImplementation((message, callback) => {
		callback(createQuickStorage());
	});

	// Do a initial setup for storage
	quickStorage.settings = undefined;
	quickStorage.repositories = undefined;
	quickStorage.rateLimit = undefined;
	await quickStorage.getStorage();
	chrome.storage.local.set.mockClear();
});

describe('autoRemoveRepo', () => {
	it('should remove repo from settings', async () => {
		expect(quickStorage.settings.repos.length).toBe(4);
		expect(quickStorage.settings.repos[1].name).toBe('myotherrepo');

		autoRemoveRepo(1);
		expect(quickStorage.settings.repos.length).toBe(3);
		expect(quickStorage.settings.repos[1].name).toBe('mythirdrepo');
		// Make a simple asumption that we actually have all other settings
		expect(quickStorage.settings.token).toBe('myToken');

		expect(ports.sendToAllTabs).toHaveBeenCalledTimes(1);

		// Check that fetchData has been called
		expect(fetchData).toHaveBeenCalledTimes(1);
	});
});
