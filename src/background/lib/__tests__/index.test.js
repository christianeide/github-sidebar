import { chrome } from 'jest-chrome';
import {
	init,
	toggleRead,
	toggleCollapsed,
	setItemInRepoAsReadBasedOnUrl,
	handleBrowserNavigation,
} from '../index.js';

import { fetchData } from '../../api/';
jest.mock('../../api/');

import { setAlarm } from '../../background.js';
jest.mock('../../background.js');

import { sendToAllTabs } from '../communication';
jest.mock('../communication');

import {
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
		const response = jest.fn();
		await init(response);

		expect(response).toHaveBeenCalledTimes(1);
		expect(response).toHaveBeenCalledWith(createQuickStorage());

		expect(setAlarm.start).toHaveBeenCalledTimes(1);
		expect(setAlarm.start).toHaveBeenCalledWith(
			createQuickStorage().settings.autoRefresh
		);

		expect(fetchData).toHaveBeenCalledTimes(1);
	});
});

describe('toggleRead', () => {
	it('should toggle read on a single item', async () => {
		// Toggle first issue to false
		let request = { id: 'issueID', type: 'toggleRead' };
		await toggleRead(request);

		// Make sure settings are saved
		expect(chrome.storage.local.set).toHaveBeenCalled();

		expect(sendToAllTabs.mock.calls[0][0].repositories[0].issues[0].read).toBe(
			true
		);

		// Toggle first issue to false
		request = { id: 'issueID', type: 'toggleRead' };
		await toggleRead(request);
		expect(sendToAllTabs.mock.calls[1][0].repositories[0].issues[0].read).toBe(
			false
		);

		// Toggle first pull to true
		request = { id: 'pullID', type: 'toggleRead' };
		await toggleRead(request);
		expect(
			sendToAllTabs.mock.calls[2][0].repositories[0].pullRequests[0].read
		).toBe(true);

		// Toggle first issue to false
		request = { id: 'pullID', type: 'toggleRead' };
		await toggleRead(request);
		expect(
			sendToAllTabs.mock.calls[3][0].repositories[0].pullRequests[0].read
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

		let repo1 = sendToAllTabs.mock.calls[0][0].repositories[0];
		expect(repo1.issues[0].read).toBe(false);
		expect(repo1.pullRequests[0].read).toBe(false);
		expect(repo1.pullRequests[1].read).toBe(false);

		sendToAllTabs.mockClear();

		// Toggle first issue to false
		request = {
			type: 'toggleRead',
			repo: createRepoURL(),
			status: true,
		};
		await toggleRead(request);

		repo1 = sendToAllTabs.mock.calls[0][0].repositories[0];
		let repo2 = sendToAllTabs.mock.calls[0][0].repositories[1];

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

		let repo1 = sendToAllTabs.mock.calls[0][0].repositories[0];
		let repo2 = sendToAllTabs.mock.calls[0][0].repositories[1];

		expect(repo1.issues[0].read).toBe(true);
		expect(repo1.pullRequests[0].read).toBe(true);
		expect(repo1.pullRequests[1].read).toBe(true);
		expect(repo2.issues[0].read).toBe(true);
		expect(repo2.pullRequests[0].read).toBe(true);
		expect(repo2.pullRequests[1].read).toBe(true);

		sendToAllTabs.mockClear();

		// Toggle first issue to false
		request = {
			type: 'toggleRead',
			status: false,
		};
		await toggleRead(request);

		repo1 = sendToAllTabs.mock.calls[0][0].repositories[0];
		repo2 = sendToAllTabs.mock.calls[0][0].repositories[1];

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
		let repo1 = sendToAllTabs.mock.calls[0][0].repositories[0];
		let repo2 = sendToAllTabs.mock.calls[0][0].repositories[1];

		expect(repo1.collapsed).toBe(false);
		// Make sure the other repo have not changes status
		expect(repo2.collapsed).toBe(true);
	});
});

describe('setItemInRepoAsReadBasedOnUrl', () => {
	it('should set item as read based on incoming url', async () => {
		const itemToChange = createInternalRepositories()[0].pullRequests[1];
		expect(itemToChange.read).toBe(false);

		const response = await setItemInRepoAsReadBasedOnUrl(itemToChange.url);

		// See that this item has changed
		expect(response[0].pullRequests[1].read).toBe(true);

		// and just double check that these items still are good :)
		expect(response[0].issues[0].read).toBe(false);
		expect(response[0].pullRequests[0].read).toBe(false);
	});

	it('should only set item as read if url contains github', async () => {
		let response = await setItemInRepoAsReadBasedOnUrl();
		expect(response).toBeFalsy();

		response = await setItemInRepoAsReadBasedOnUrl('https://www.google.com');
		expect(response).toBeFalsy();
	});
});

describe('handeBrowserNavigation', () => {
	it('should set new repodata if url matches a repo', async () => {
		const tabId = 45;
		await handleBrowserNavigation(tabId, {
			url: createRepoURL(),
		});

		expect(sendToAllTabs).toHaveBeenCalledTimes(1);
		expect(chrome.storage.local.set).toHaveBeenCalledTimes(1);
	});

	it('should not set new repodata if no data returned', async () => {
		const tabId = 45;
		await chrome.tabs.onUpdated.callListeners(tabId, {});

		expect(sendToAllTabs).not.toHaveBeenCalled();
		expect(chrome.storage.local.set).not.toHaveBeenCalled();
	});
});
