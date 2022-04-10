import { sendToAllTabs } from '../communication';
import { setAlarm } from '../../background';
jest.mock('../../background');
import { chrome } from 'jest-chrome';

const message = 'This is my message!';

describe('sendToAllTabs', () => {
	it('should stop the alarm if no active tabs', async () => {
		// Make sure we handle both an empty array and missing data
		const callbackSpy = jest.fn();
		chrome.tabs.query.mockImplementation((message, callback) => {
			callback(undefined);
		});
		chrome.tabs.query(message, callbackSpy);

		sendToAllTabs(message);
		expect(setAlarm.stop).toHaveBeenCalledTimes(1);
		setAlarm.stop.mockClear();

		const response = [];
		chrome.tabs.query.mockImplementation((message, callback) => {
			callback(response);
		});
		chrome.tabs.query(message, callbackSpy);

		sendToAllTabs(message);
		expect(setAlarm.stop).toHaveBeenCalledTimes(1);
	});

	it('should send message to all tabs', async () => {
		const callbackSpy = jest.fn();
		const response = [{ id: 1 }, { id: 2 }, { id: 3 }];
		chrome.tabs.query.mockImplementation((message, callback) => {
			callback(response);
		});
		chrome.tabs.sendMessage.mockImplementation(() => {
			return {
				catch: jest.fn(),
			};
		});
		chrome.tabs.query(message, callbackSpy);

		sendToAllTabs(message);
		expect(setAlarm.stop).not.toHaveBeenCalled();

		expect(chrome.tabs.sendMessage).toHaveBeenCalledTimes(3);
		expect(chrome.tabs.sendMessage.mock.calls[0][0]).toBe(1);
		expect(chrome.tabs.sendMessage.mock.calls[0][1]).toBe(message);
	});
});
