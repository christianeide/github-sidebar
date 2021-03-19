import { chrome } from 'jest-chrome';
import { autoFetch } from '../../background.js';
import { defaultSettings, saveSettings } from '../../settings/';
import {
	init,
	toggleRead,
	toggleCollapsed,
	setItemInRepoAsReadBasedOnUrl,
} from '../index.js';

import { fetchData } from '../../api/';
jest.mock('../../api/');

import * as ports from '../ports';
jest.mock('../ports');

import {
	createChromePort,
	createRepoURL,
	createInternalRepositories,
	createQuickStorage,
} from '../../../../test/generate.js';
import { setupBackgroundTests } from '../../../../test/setup.js';

beforeEach(async () => {
	setupBackgroundTests();
});

describe('init', () => {
	it('should return inital data on init', async () => {
		const port = createChromePort();
		await init(port);

		expect(port.postMessage).toHaveBeenCalledTimes(1);
		expect(port.postMessage).toHaveBeenCalledWith(createQuickStorage());

		expect(autoFetch.timer).toBeTruthy();

		expect(ports.add).toHaveBeenCalledTimes(1);
		expect(ports.add).toHaveBeenCalledWith(port);

		expect(fetchData).toHaveBeenCalledTimes(1);
	});

	it('should only start a autofetch if its not running', async () => {
		const port = createChromePort();
		await init(port);

		const timerRef = autoFetch.timer;
		expect(autoFetch.timer).toBeTruthy();

		await init(port);
		expect(autoFetch.timer).toEqual(timerRef);
	});
});

describe('toggleRead', () => {
	it('should toggle read on a single item', async () => {
		// Toggle first issue to false
		let request = { id: 'issueID', type: 'toggleRead' };
		await toggleRead(request);

		// Make sure settings are saved
		expect(chrome.storage.local.set).toHaveBeenCalled();

		expect(
			ports.sendToAllTabs.mock.calls[0][0].repositories[0].issues[0].read
		).toBe(true);

		// Toggle first issue to false
		request = { id: 'issueID', type: 'toggleRead' };
		await toggleRead(request);
		expect(
			ports.sendToAllTabs.mock.calls[1][0].repositories[0].issues[0].read
		).toBe(false);

		// Toggle first pull to true
		request = { id: 'pullID', type: 'toggleRead' };
		await toggleRead(request);
		expect(
			ports.sendToAllTabs.mock.calls[2][0].repositories[0].pullRequests[0].read
		).toBe(true);

		// Toggle first issue to false
		request = { id: 'pullID', type: 'toggleRead' };
		await toggleRead(request);
		expect(
			ports.sendToAllTabs.mock.calls[3][0].repositories[0].pullRequests[0].read
		).toBe(false);
	});

	it('should toggle read on all items in a repo', async () => {
		// Toggle first issue to false
		let request = {
			type: 'toggleRead',
			repo: createRepoURL(),
			status: false,
		};
		await toggleRead(request);

		let repo1 = ports.sendToAllTabs.mock.calls[0][0].repositories[0];
		expect(repo1.issues[0].read).toBe(false);
		expect(repo1.pullRequests[0].read).toBe(false);
		expect(repo1.pullRequests[1].read).toBe(false);

		ports.sendToAllTabs.mockClear();

		// Toggle first issue to false
		request = {
			type: 'toggleRead',
			repo: createRepoURL(),
			status: true,
		};
		await toggleRead(request);

		repo1 = ports.sendToAllTabs.mock.calls[0][0].repositories[0];
		let repo2 = ports.sendToAllTabs.mock.calls[0][0].repositories[1];

		expect(repo1.issues[0].read).toBe(true);
		expect(repo1.pullRequests[0].read).toBe(true);
		expect(repo1.pullRequests[1].read).toBe(true);

		// Expext other repos read-status to not have been called
		expect(repo2.pullRequests[0].read).toBe(false);
		expect(repo2.pullRequests[1].read).toBe(false);
	});

	it('should toggle read on all items regardless of repo', async () => {
		// Toggle first issue to false
		let request = {
			type: 'toggleRead',
			status: true,
		};
		await toggleRead(request);

		let repo1 = ports.sendToAllTabs.mock.calls[0][0].repositories[0];
		let repo2 = ports.sendToAllTabs.mock.calls[0][0].repositories[1];

		expect(repo1.issues[0].read).toBe(true);
		expect(repo1.pullRequests[0].read).toBe(true);
		expect(repo1.pullRequests[1].read).toBe(true);
		expect(repo2.issues[0].read).toBe(true);
		expect(repo2.pullRequests[0].read).toBe(true);
		expect(repo2.pullRequests[1].read).toBe(true);

		ports.sendToAllTabs.mockClear();

		// Toggle first issue to false
		request = {
			type: 'toggleRead',
			status: false,
		};
		await toggleRead(request);

		repo1 = ports.sendToAllTabs.mock.calls[0][0].repositories[0];
		repo2 = ports.sendToAllTabs.mock.calls[0][0].repositories[1];

		expect(repo1.issues[0].read).toBe(false);
		expect(repo1.pullRequests[0].read).toBe(false);
		expect(repo1.pullRequests[1].read).toBe(false);
		expect(repo2.issues[0].read).toBe(false);
		expect(repo2.pullRequests[0].read).toBe(false);
		expect(repo2.pullRequests[1].read).toBe(false);
	});
});

describe('toggleCollapsed', () => {
	it('should toggle a repos collapsed', async () => {
		let request = {
			type: 'toggleCollapsed',
			url: createRepoURL(),
		};
		await toggleCollapsed(request);

		// Make sure settings are saved
		expect(chrome.storage.local.set).toHaveBeenCalled();

		// See what before value is
		let repo1 = ports.sendToAllTabs.mock.calls[0][0].repositories[0];
		let repo2 = ports.sendToAllTabs.mock.calls[0][0].repositories[1];

		expect(repo1.collapsed).toBe(false);
		// Make sure the other repo have not changes status
		expect(repo2.collapsed).toBe(true);
	});
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

describe('setItemInRepoAsReadBasedOnUrl', () => {
	it('should set item as read based on incoming url', () => {
		const itemToChange = createInternalRepositories()[0].pullRequests[1];
		expect(itemToChange.read).toBe(false);

		const response = setItemInRepoAsReadBasedOnUrl(itemToChange.url);

		// See that this item has changed
		expect(response[0].pullRequests[1].read).toBe(true);

		// and just double check that these items still are good :)
		expect(response[0].issues[0].read).toBe(false);
		expect(response[0].pullRequests[0].read).toBe(false);
	});

	it('should only set item as read if url contains github', () => {
		let response = setItemInRepoAsReadBasedOnUrl();
		expect(response).toBeFalsy();

		response = setItemInRepoAsReadBasedOnUrl('https://www.google.com');
		expect(response).toBeFalsy();
	});
});
