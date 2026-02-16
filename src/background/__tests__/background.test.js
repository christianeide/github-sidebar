// Using rewire to get non exported functions
import { vi } from 'vitest';
import { setAlarm } from '../background.js';
import { chrome } from 'jest-chrome';

import { fetchData, apiErrors } from '../api/';
vi.mock('../api/', () => {
	return {
		apiErrors: {
			set: vi.fn(),
			get: vi.fn(() => {
				return [];
			}),
		},
		fetchData: vi.fn(),
	};
});

// For some reason a default mock wont work, so need to manually mock each function.
// It might have something to do with jest-chrome
import { init, toggleRead, toggleCollapsed } from '../lib/';
vi.mock('../lib/', () => {
	return {
		setItemInRepoAsReadBasedOnUrl: vi.fn(() => {
			return {
				then: vi.fn(() => {
					return 'mockRepoData';
				}),
			};
		}),
		handleBrowserNavigation: vi.fn(),
		init: vi.fn(),
		toggleRead: vi.fn(),
		toggleCollapsed: vi.fn(),
		apiErrors: vi.fn(),
	};
});

import { sendToAllTabs } from '../lib/communication';
vi.mock('../lib/communication', () => {
	return {
		sendToAllTabs: vi.fn(),
	};
});

import { saveSettings } from '../settings/save.js';
vi.mock('../settings/save.js', () => {
	return {
		saveSettings: vi.fn(),
	};
});

beforeEach(async () => {
	setAlarm.stop();
});

describe('setAlarm', () => {
	it('should check if alarm is running', () => {
		const callbackSpy = vi.fn();
		const alarm = { active: true };
		chrome.alarms.get.mockImplementation((message, callback) => {
			callback(alarm);
		});

		setAlarm.isRunning(callbackSpy);

		expect(chrome.alarms.get).toHaveBeenLastCalledWith(
			setAlarm.timerName,
			callbackSpy,
		);
		expect(callbackSpy).toHaveBeenCalledTimes(1);
		expect(callbackSpy).toHaveBeenLastCalledWith(alarm);
	});

	it('should not start a new alarm if one is already running', async () => {
		const callbackSpy = vi.fn();
		const alarm = { active: true };
		chrome.alarms.get.mockImplementation((message, callback) => {
			callback(alarm);
		});

		setAlarm.start(callbackSpy);

		expect(chrome.alarms.create).not.toHaveBeenCalled();
	});

	it('should start a new alarm if one is not already running', async () => {
		const intervalInMs = 120000;
		const intervalInSec = 2;
		const alarm = null;
		chrome.alarms.get.mockImplementation((message, callback) => {
			callback(alarm);
		});

		setAlarm.start(intervalInMs);

		expect(chrome.alarms.create).toHaveBeenCalledTimes(1);
		expect(chrome.alarms.create).toHaveBeenLastCalledWith(setAlarm.timerName, {
			periodInMinutes: intervalInSec,
		});
	});

	it('should not stop alarm if no timer is running', async () => {
		const alarm = null;
		chrome.alarms.get.mockImplementation((message, callback) => {
			callback(alarm);
		});

		setAlarm.stop();

		expect(chrome.alarms.clear).not.toHaveBeenCalled();
	});

	it('should sttop a new alarm if one is not already running', async () => {
		const alarm = { active: true };
		chrome.alarms.get.mockImplementation((message, callback) => {
			callback(alarm);
		});

		setAlarm.stop();

		expect(chrome.alarms.clear).toHaveBeenCalledTimes(1);
		expect(chrome.alarms.clear).toHaveBeenLastCalledWith(setAlarm.timerName);
	});

	it('should change timer if timer is running', async () => {
		const intervalInMs = 180000;
		const intervalInSec = 3;
		const alarm = { active: true };
		chrome.alarms.get.mockImplementation((message, callback) => {
			callback(alarm);
		});

		setAlarm.change(intervalInMs);

		expect(chrome.alarms.create).toHaveBeenCalledTimes(1);
		expect(chrome.alarms.create).toHaveBeenLastCalledWith(setAlarm.timerName, {
			periodInMinutes: intervalInSec,
		});
	});

	it('should not change timer if timer is not running', async () => {
		const alarm = null;
		chrome.alarms.get.mockImplementation((message, callback) => {
			callback(alarm);
		});

		setAlarm.change();

		expect(chrome.alarms.create).not.toHaveBeenCalled();
	});

	it('should call fetch on each allarm tick', async () => {
		setAlarm.alarmTick();

		expect(fetchData).toHaveBeenCalledTimes(1);
	});
});

describe('chrome.tabs.onUpdated', () => {
	it('should have a listener for onUpdated', async () => {
		expect(chrome.tabs.onUpdated.hasListeners()).toBe(true);
	});
});

describe('chrome.runtime.onMessage', () => {
	it('should setup listeners for messages', async () => {
		expect(chrome.runtime.onMessage.hasListeners()).toBe(true);
	});

	it('should call events based on incoming message', async () => {
		const sender = vi.fn();
		const sendResponse = vi.fn();

		let request = { type: 'init' };
		chrome.runtime.onMessage.callListeners(request, sender, sendResponse);
		expect(init).toHaveBeenCalledTimes(1);
		expect(init).toHaveBeenCalledWith(sendResponse);

		request = { type: 'toggleRead' };
		chrome.runtime.onMessage.callListeners(request);
		expect(toggleRead).toHaveBeenCalledTimes(1);
		expect(toggleRead).toHaveBeenCalledWith({ type: 'toggleRead' });

		request = { type: 'toggleCollapsed' };
		chrome.runtime.onMessage.callListeners(request);
		expect(toggleCollapsed).toHaveBeenCalledTimes(1);
		expect(toggleCollapsed).toHaveBeenCalledWith({ type: 'toggleCollapsed' });

		request = { type: 'saveSettings', settings: 'newSettings' };
		chrome.runtime.onMessage.callListeners(request);
		expect(saveSettings).toHaveBeenCalledTimes(1);
		expect(saveSettings).toHaveBeenCalledWith('newSettings');

		request = { type: 'clearErrors' };
		chrome.runtime.onMessage.callListeners(request);
		expect(sendToAllTabs).toHaveBeenCalledTimes(1);
		expect(sendToAllTabs).toHaveBeenCalledWith({ errors: [] });
		expect(apiErrors.set).toHaveBeenCalledTimes(1);
		expect(apiErrors.set).toHaveBeenCalledWith([]);
		expect(apiErrors.get).toHaveBeenCalledTimes(1);
	});
});
