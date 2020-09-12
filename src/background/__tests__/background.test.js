import {} from '../background.js';
import { chrome } from 'jest-chrome';

describe('chrome.runtime.onConnect', () => {
	it('should setup listeners to incoming ports!', () => {
		const port = {
			name: 'port_name',
			disconnect: jest.fn(),
			onMessage: {
				addListener: jest.fn(),
			},
			postMessage: jest.fn(),
		};

		expect(chrome.runtime.onConnect.hasListeners()).toBe(true);
		chrome.runtime.onConnect.callListeners(port);

		expect(port.onMessage.addListener).toBeCalledTimes(1);
	});

	it('should setup listeners to incoming ports!', () => {
		const port = {
			name: 'port_name',
			disconnect: jest.fn(),
			onMessage: {
				addListener: jest.fn(),
			},
			postMessage: jest.fn(),
		};

		expect(chrome.runtime.onConnect.hasListeners()).toBe(true);
		chrome.runtime.onConnect.callListeners(port);

		port.onMessage.callListeners({ type: 'init' });

		expect(port.onMessage.addListener).toBeCalledTimes(1);
	});
});

describe('chrome.tabs.onUpdated', () => {
	it('should expect exiting things!', () => {
		// const message = { greeting: 'hello?' };
		// const response = { greeting: 'here I am' };
		// const callbackSpy = jest.fn();
		// // chrome.runtime.sendMessage.mockImplementation((message, callback) => {
		// // 	callback(response);
		// // });
		// // chrome.runtime.sendMessage(message, callbackSpy);
		// const tabID = 1;
		// const changeInfo = { url: 'https://github.com/christianeide' };
		// chrome.tabs.onUpdated.callListeners(1, changeInfo);
		// expect(chrome.tabs.onUpdated.addListener).toBeCalledTimes(1);
		// expect(callbackSpy).toBeCalledWith(response);
	});
});
