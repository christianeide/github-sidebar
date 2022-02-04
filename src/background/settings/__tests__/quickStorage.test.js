import { quickStorage, defaultSettings } from '../index.js';
import { chrome } from 'jest-chrome';
import { createQuickStorage } from '../../../../test/generate.js';

describe('quickstorage', () => {
	it('should get data from local storage if none is fetched', async () => {
		const response = createQuickStorage();

		chrome.storage.local.get.mockImplementation((message, callback) => {
			callback(response);
		});

		const getStorage = await quickStorage.getStorage();

		expect(chrome.storage.local.get).toHaveBeenCalledTimes(1);
		expect(chrome.storage.local.get).toBeCalledWith(
			['settings', 'repositories', 'rateLimit'],
			expect.any(Function)
		);

		const mergedSettings = { ...defaultSettings, ...response.settings };

		const settings = await quickStorage.getSettings();
		const repositories = await quickStorage.getRepositories();
		const rateLimit = await quickStorage.getRateLimit();

		expect(settings).toEqual({
			...defaultSettings,
			...response.settings,
		});
		expect(repositories).toEqual(response.repositories);
		expect(rateLimit).toEqual(response.rateLimit);

		expect(getStorage).toEqual({ ...response, settings: mergedSettings });
	});

	it('should return data from memory if data exists', async () => {
		const response = createQuickStorage();

		const getStorage = await quickStorage.getStorage();

		expect(chrome.storage.local.get).not.toHaveBeenCalled();

		const mergedSettings = { ...defaultSettings, ...response.settings };

		expect(getStorage).toEqual({ ...response, settings: mergedSettings });
	});
});
