import { chrome } from 'jest-chrome';
import { autoFetch } from '../../background.js';
import defaultSettings from '../defaultSettings.json';
import { quickStorage } from '../quickStorage.js';
import { saveSettings } from '../save.js';

import { fetchData } from '../../api/index.js';
jest.mock('../../api/index.js');

import * as ports from '../../lib/ports';
jest.mock('../../lib/ports');

import { createQuickStorage } from '../../../../test/generate.js';

beforeEach(async () => {
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

describe('saveSettings', () => {
	it('should save settings', async () => {
		const newSettings = { token: 'mynewtoken' };
		const completeSettings = {
			settings: {
				...defaultSettings,
				...newSettings,
			},
		};
		saveSettings(newSettings);

		// Make sure settings are saved
		expect(chrome.storage.local.set).toHaveBeenCalled();

		expect(chrome.storage.local.set).toHaveBeenCalledWith(completeSettings);

		expect(ports.sendToAllTabs).toHaveBeenCalledTimes(1);
		expect(ports.sendToAllTabs).toHaveBeenNthCalledWith(1, completeSettings);

		// Check that fetchData has been called
		expect(fetchData).toHaveBeenCalledTimes(1);
	});

	it('should not change timer if autorefresh has not changed', async () => {
		const changeSpy = jest.spyOn(autoFetch, 'change');

		// Change should not be called if no autoRefresh
		saveSettings({});
		expect(changeSpy).not.toHaveBeenCalled();

		// Change should not be called if autorrefresh is below minimum
		saveSettings({ autoRefresh: 1 });
		expect(changeSpy).not.toHaveBeenCalled();
	});

	it('should changee timer if autorefresh has changed', async () => {
		const changeSpy = jest.spyOn(autoFetch, 'change');

		// Change Only to be called if autorefresh changes
		saveSettings({ autoRefresh: 15 });
		saveSettings({ autoRefresh: 20 });
		saveSettings({ autoRefresh: 20 });
		expect(changeSpy).toHaveBeenCalledTimes(2);
	});
});
