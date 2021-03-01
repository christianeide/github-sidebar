import { quickStorage } from '../quickStorage.js';
import { chrome } from 'jest-chrome';
import defaultSettings from '../defaultSettings.json';

describe('quickstorage', () => {
	it('should have an initial setup', () => {
		expect(quickStorage).toEqual({
			settings: undefined,
			repositories: undefined,
			rateLimit: undefined,
			getStorage: expect.any(Function),
		});
	});

	it('should get data from local storage if none is fetched', async () => {
		const response = {
			settings: { token: 'myToken' },
			repositories: [{ repo: '1' }, { repo: '2' }],
			rateLimit: { max: 1000 },
		};

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
		expect(quickStorage.settings).toEqual({
			...defaultSettings,
			...response.settings,
		});
		expect(quickStorage.repositories).toEqual(response.repositories);
		expect(quickStorage.rateLimit).toEqual(response.rateLimit);

		expect(getStorage).toEqual({ ...response, settings: mergedSettings });
	});

	it('should return data from memory if data exists', async () => {
		const response = {
			settings: { token: 'myToken' },
			repositories: [{ repo: '1' }, { repo: '2' }],
			rateLimit: { max: 1000 },
		};

		const getStorage = await quickStorage.getStorage();

		expect(chrome.storage.local.get).not.toHaveBeenCalled();

		const mergedSettings = { ...defaultSettings, ...response.settings };

		expect(getStorage).toEqual({ ...response, settings: mergedSettings });
	});
});
