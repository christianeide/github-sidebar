import { chrome } from 'jest-chrome';
import { autoFetch } from '../../background.js';
import defaultSettings from '../defaultSettings.json';
import { saveSettings } from '../save.js';

import { fetchData } from '../../api/index.js';
jest.mock('../../api/index.js');

import * as ports from '../../lib/ports';
jest.mock('../../lib/ports');

import { setupBackgroundTests } from '../../../../test/setup.js';

beforeEach(async () => {
	setupBackgroundTests();
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
