import { chrome } from 'jest-chrome';
import { setAlarm } from '../../background.js';
import { defaultSettings, saveSettings } from '../index';

import { fetchData } from '../../api/';
jest.mock('../../api/');

import { sendToAllTabs } from '../../lib/communication';
jest.mock('../../lib/communication');

import { setupBackgroundTests } from '../../../../test/setup.js';

beforeEach(async () => {
	await setupBackgroundTests();
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
		await saveSettings(newSettings);
		// Make sure settings are saved
		expect(chrome.storage.local.set).toHaveBeenCalled();
		expect(chrome.storage.local.set).toHaveBeenCalledWith(completeSettings);
		expect(sendToAllTabs).toHaveBeenCalledTimes(1);
		expect(sendToAllTabs).toHaveBeenNthCalledWith(1, completeSettings);
		// Check that fetchData has been called
		expect(fetchData).toHaveBeenCalledTimes(1);
	});

	it('should not change timer if autorefresh has not changed', async () => {
		const changeSpy = jest.spyOn(setAlarm, 'change');

		// Change should not be called if no autoRefresh
		await saveSettings({});
		expect(changeSpy).not.toHaveBeenCalled();

		// Change should not be called if autorrefresh is below minimum
		saveSettings({ autoRefresh: 1 });
		expect(changeSpy).not.toHaveBeenCalled();
	});

	it('should changee timer if autorefresh has changed', async () => {
		const changeSpy = jest.spyOn(setAlarm, 'change');

		// Change Only to be called if autorefresh changes
		const minInMs = 60000;
		await saveSettings({ autoRefresh: minInMs });
		await saveSettings({ autoRefresh: minInMs * 2 });
		await saveSettings({ autoRefresh: minInMs * 2 });
		expect(changeSpy).toHaveBeenCalledTimes(2);
	});
});
