// Using rewire to get non exported functions
import { autoFetch } from '../background.js';
import { chrome } from 'jest-chrome';
import { fetchData } from '../api/index.js';
import {
	init,
	setItemInRepoAsReadBasedOnUrl,
	toggleRead,
	toggleCollapsed,
} from '../lib/index.js';
// For some reason a default mock wont work, so need to manually mock each function.
// It might have something to do with jest-chrome
jest.mock('../lib/index.js', () => {
	return {
		sendToAllTabs: jest.fn(),
		setItemInRepoAsReadBasedOnUrl: jest.fn(() => {
			return 'mockRepoData';
		}),
		init: jest.fn(),
		toggleRead: jest.fn(),
		toggleCollapsed: jest.fn(),
		apiErrors: jest.fn(),
	};
});

import { saveSettings } from '../settings/save.js';
jest.mock('../settings/save.js', () => {
	return {
		saveSettings: jest.fn(),
	};
});

import { sendToAllTabs } from '../lib/ports.js';
jest.mock('../lib/ports.js');

import { createChromePort, createRepoURL } from '../../../test/generate.js';

jest.useFakeTimers();

beforeEach(() => {
	autoFetch.stop();
	setInterval.mockClear();
	clearInterval.mockClear();
});

describe('autoFetch', () => {
	it('should start a new interval', async () => {
		const timeInSeconds = 20;
		const timeInMilliseconds = timeInSeconds * 1000;

		expect(autoFetch.timer).toBeUndefined();
		autoFetch.start(timeInSeconds);

		expect(autoFetch.timer).toBeTruthy();

		expect(setInterval).toHaveBeenCalledTimes(1);
		expect(setInterval).toHaveBeenLastCalledWith(fetchData, timeInMilliseconds);
	});

	it('should stop timer if timer is running', async () => {
		const timeInSeconds = 20;

		autoFetch.start(timeInSeconds);
		const runningTimer = autoFetch.timer;
		expect(runningTimer).toBeTruthy();

		autoFetch.stop();
		expect(autoFetch.timer).toBeUndefined();

		expect(clearInterval).toHaveBeenCalledTimes(1);
		expect(clearInterval).toHaveBeenLastCalledWith(runningTimer);
	});

	it('should do nothing if timer is not running', async () => {
		autoFetch.stop();

		expect(autoFetch.timer).toBeUndefined();
		expect(clearInterval).not.toHaveBeenCalled();
	});

	it('should change timer if timer is running', async () => {
		const timeInSeconds = 20;

		autoFetch.start(timeInSeconds);
		setInterval.mockClear();
		const runningTimer = autoFetch.timer;

		const newTimeInSeconds = 30;
		const timeInMilliseconds = newTimeInSeconds * 1000;

		autoFetch.change(newTimeInSeconds);

		expect(clearInterval).toHaveBeenCalledTimes(1);
		expect(clearInterval).toHaveBeenLastCalledWith(runningTimer);

		expect(runningTimer !== autoFetch.timer).toBe(true);
		expect(setInterval).toHaveBeenCalledTimes(1);
		expect(setInterval).toHaveBeenLastCalledWith(fetchData, timeInMilliseconds);
	});

	it('should not change timer if timer is not running', async () => {
		const newTimeInSeconds = 30;

		autoFetch.change(newTimeInSeconds);

		expect(clearInterval).not.toHaveBeenCalled();
		expect(setInterval).not.toHaveBeenCalled();
	});
});

describe('chrome.tabs.onUpdated', () => {
	it('should set new repodata if url matches a repo', async () => {
		expect(chrome.tabs.onUpdated.hasListeners()).toBe(true);

		const tabId = 45;
		chrome.tabs.onUpdated.callListeners(tabId, {
			url: createRepoURL(),
		});

		expect(setItemInRepoAsReadBasedOnUrl).toHaveBeenCalledTimes(1);

		expect(sendToAllTabs).toHaveBeenCalledTimes(1);

		const expectedData = { repositories: 'mockRepoData' };
		expect(sendToAllTabs).toHaveBeenCalledWith(expectedData);

		expect(chrome.storage.local.set).toHaveBeenCalledTimes(1);
		expect(chrome.storage.local.set).toHaveBeenCalledWith(expectedData);
	});

	it('should not set new repodata if url dont match regex', async () => {
		setItemInRepoAsReadBasedOnUrl.mockReturnValueOnce();

		const tabId = 45;
		chrome.tabs.onUpdated.callListeners(tabId, {
			url: createRepoURL(),
		});

		expect(sendToAllTabs).not.toHaveBeenCalled();

		// Make sure repositories and rateLimit have been set
		expect(chrome.storage.local.set).not.toHaveBeenCalled();
	});
});

describe('chrome.runtime.onConnect', () => {
	it('should setup listeners on incoming port', async () => {
		expect(chrome.runtime.onConnect.hasListeners()).toBe(true);
		const port = createChromePort();

		chrome.runtime.onConnect.callListeners(port);

		expect(port.onMessage.addListener).toHaveBeenCalled();
	});

	it('should call events based on incoming message', async () => {
		let port = createChromePort({ type: 'init' });
		chrome.runtime.onConnect.callListeners(port);
		expect(init).toHaveBeenCalledTimes(1);
		expect(init).toHaveBeenCalledWith(port);

		port = createChromePort({ type: 'toggleRead' });
		chrome.runtime.onConnect.callListeners(port);
		expect(toggleRead).toHaveBeenCalledTimes(1);
		expect(toggleRead).toHaveBeenCalledWith({ type: 'toggleRead' });

		port = createChromePort({ type: 'toggleCollapsed' });
		chrome.runtime.onConnect.callListeners(port);
		expect(toggleCollapsed).toHaveBeenCalledTimes(1);
		expect(toggleCollapsed).toHaveBeenCalledWith({ type: 'toggleCollapsed' });

		port = createChromePort({ type: 'saveSettings', settings: 'newSettings' });
		chrome.runtime.onConnect.callListeners(port);
		expect(saveSettings).toHaveBeenCalledTimes(1);
		expect(saveSettings).toHaveBeenCalledWith('newSettings');

		port = createChromePort({ type: 'clearErrors' });
		chrome.runtime.onConnect.callListeners(port);
		expect(sendToAllTabs).toHaveBeenCalledTimes(1);
		expect(sendToAllTabs).toHaveBeenCalledWith({ errors: [] });
	});
});
