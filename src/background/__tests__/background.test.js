// import background from '../background.js';
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
});

// describe('toggleCollapsed', () => {
// 	it('should setup listeners to incoming ports!', () => {
// 		const secret = background.__get__('toggleCollapsed'); // rewire magic happens here
// 		expect(secret()).toBe('🤫');
// 	});
// });
