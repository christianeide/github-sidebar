import { chrome } from 'jest-chrome';
import { autoFetch } from '../../background.js';
import defaultSettings from '../defaultSettings.json';
import { quickStorage } from '../quickStorage.js';
import {
	init,
	toggleRead,
	toggleCollapsed,
	transferUserStatus,
	setItemInRepoAsReadBasedOnUrl,
	saveSettings,
	autoRemoveRepo,
	fetchData,
} from '../utils.js';

import { fetchDataFromAPI } from '../fetch.js';
jest.mock('../fetch.js');

import * as ports from '../ports';
jest.mock('../ports.js');

import {
	createRateLimit,
	createInterenalRepository,
	createChromePort,
	createRepoURL,
	createInternalRepositories,
	createQuickStorage,
} from '../../../../test/generate.js';

beforeEach(async () => {
	// Before each test we calll getStoragge() and do a basic setup
	// This will get data from storage, so we mock the return data
	// At the same time we mock the return data from fetch as well.
	// Finally we clear any calls theese mocks have received
	chrome.storage.local.get.mockImplementation((message, callback) => {
		callback(createQuickStorage());
	});

	fetchDataFromAPI.mockImplementation(() => {
		return Promise.resolve({
			newRepoData: createInternalRepositories(),
			rateLimit: createRateLimit(),
		});
	});

	// Do a initial setup for storage
	quickStorage.getStorage();
	chrome.storage.local.set.mockClear();
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

		expect(fetchDataFromAPI).toHaveBeenCalledTimes(1);
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
			ports.messageAll.mock.calls[0][0].repositories[0].issues[0].read
		).toBe(false);

		// Toggle first issue to true
		request = { id: 'issueID', type: 'toggleRead' };
		await toggleRead(request);
		expect(
			ports.messageAll.mock.calls[1][0].repositories[0].issues[0].read
		).toBe(true);

		// Toggle first pull to false
		request = { id: 'pullID', type: 'toggleRead' };
		await toggleRead(request);
		expect(
			ports.messageAll.mock.calls[2][0].repositories[0].pullRequests[0].read
		).toBe(false);

		// Toggle first issue to true
		request = { id: 'pullID', type: 'toggleRead' };
		await toggleRead(request);
		expect(
			ports.messageAll.mock.calls[3][0].repositories[0].pullRequests[0].read
		).toBe(true);
	});

	it('should toggle read on all items in a repo', async () => {
		// Toggle first issue to false
		let request = {
			type: 'toggleRead',
			repo: createRepoURL(),
			status: false,
		};
		await toggleRead(request);

		let repo1 = ports.messageAll.mock.calls[0][0].repositories[0];
		expect(repo1.issues[0].read).toBe(false);
		expect(repo1.pullRequests[0].read).toBe(false);
		expect(repo1.pullRequests[1].read).toBe(false);

		ports.messageAll.mockClear();

		// Toggle first issue to false
		request = {
			type: 'toggleRead',
			repo: createRepoURL(),
			status: true,
		};
		await toggleRead(request);

		repo1 = ports.messageAll.mock.calls[0][0].repositories[0];
		let repo2 = ports.messageAll.mock.calls[0][0].repositories[1];

		expect(repo1.issues[0].read).toBe(true);
		expect(repo1.pullRequests[0].read).toBe(true);
		expect(repo1.pullRequests[1].read).toBe(true);

		// Expext other repos read-status to not have been called
		expect(repo2.pullRequests[0].read).toBe(true);
		expect(repo2.pullRequests[1].read).toBe(false);
	});

	it('should toggle read on all items regardless of repo', async () => {
		// Toggle first issue to false
		let request = {
			type: 'toggleRead',
			status: true,
		};
		await toggleRead(request);

		let repo1 = ports.messageAll.mock.calls[0][0].repositories[0];
		let repo2 = ports.messageAll.mock.calls[0][0].repositories[1];

		expect(repo1.issues[0].read).toBe(true);
		expect(repo1.pullRequests[0].read).toBe(true);
		expect(repo1.pullRequests[1].read).toBe(true);
		expect(repo2.issues[0].read).toBe(true);
		expect(repo2.pullRequests[0].read).toBe(true);
		expect(repo2.pullRequests[1].read).toBe(true);

		ports.messageAll.mockClear();

		// Toggle first issue to false
		request = {
			type: 'toggleRead',
			status: false,
		};
		await toggleRead(request);

		repo1 = ports.messageAll.mock.calls[0][0].repositories[0];
		repo2 = ports.messageAll.mock.calls[0][0].repositories[1];

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
		let repo1 = ports.messageAll.mock.calls[0][0].repositories[0];
		let repo2 = ports.messageAll.mock.calls[0][0].repositories[1];

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

		expect(ports.messageAll).toHaveBeenCalledTimes(2);
		expect(ports.messageAll).toHaveBeenNthCalledWith(1, completeSettings);

		// Check that fetchData has been called
		expect(fetchDataFromAPI).toHaveBeenCalledTimes(1);
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

describe('fetchData', () => {
	it('should not fetch if settings or token is missing', async () => {
		// make sure it cheks for settings
		quickStorage.settings = undefined;
		await fetchData();
		expect(fetchDataFromAPI).not.toHaveBeenCalled();

		// Make sure it cheks for token
		quickStorage.settings = { someProp: '' };
		await fetchData();
		expect(fetchDataFromAPI).not.toHaveBeenCalled();

		// Make sure token actuallly have a value
		quickStorage.settings = { someProp: '', token: '' };
		await fetchData();
		expect(fetchDataFromAPI).not.toHaveBeenCalled();

		// set settings to undefined so we can recreate settings
		quickStorage.settings = undefined;
	});

	it('should fetch and transfer old data to new data', async () => {
		await fetchData();

		expect(ports.messageAll).toHaveBeenNthCalledWith(1, { loading: true });

		// Make sure repositories and rateLimit have been set
		expect(chrome.storage.local.set).toHaveBeenCalledTimes(2);

		expect(ports.messageAll).toHaveBeenNthCalledWith(2, {
			repositories: createInternalRepositories(),
			rateLimit: createRateLimit(),
			loading: false,
		});
	});

	it('should send errors to users', async () => {
		const errorMessage = {
			title: 'Error in API query to Github ',
			message: 'Errormessage',
			time: Date.now(),
		};

		fetchDataFromAPI.mockImplementationOnce(() => {
			return Promise.reject([errorMessage]);
		});

		await fetchData();
		expect(ports.messageAll).toHaveBeenNthCalledWith(2, {
			errors: [errorMessage],
			loading: false,
		});
	});

	it('should not send errors to user if err-message is missing', async () => {
		fetchDataFromAPI.mockImplementationOnce(() => {
			return Promise.reject();
		});

		await fetchData();

		expect(ports.messageAll).toHaveBeenCalledTimes(1);
	});
});

describe('transferUserStatus', () => {
	it('should fetch and transfer old data to new data', () => {
		const newFetchedRepositories = createInternalRepositories(3, {
			collapsed: false,
			read: false,
		});

		const response = transferUserStatus(newFetchedRepositories);

		const firstRepo = response[0];

		// Should use old data, wich is true, and not the false data
		// sent into from this new repo
		expect(firstRepo.collapsed).toBe(true);

		expect(firstRepo.issues).toBeInstanceOf(Array);
		expect(firstRepo.issues.length).toBe(1);
		expect(firstRepo.pullRequests).toBeInstanceOf(Array);
		expect(firstRepo.pullRequests.length).toBe(2);

		// The newly fetched read data for issue 1 and pull1 is set to false
		// But we expeect this to be set to true based on previous repodata
		expect(firstRepo.issues[0].read).toBe(true);
		expect(firstRepo.pullRequests[0].read).toBe(true);
		expect(firstRepo.pullRequests[1].read).toBe(false);
	});

	it('should handle if repoddata dont contain the specified type (issue or pulllrequest)', () => {
		const newFetchedRepositories = [
			{
				collapsed: true,
				url: createRepoURL(),
			},
		];

		const response = transferUserStatus(newFetchedRepositories);

		// just need to make sure nothing broke with data missing
		expect(response).toBeTruthy();
	});

	it('should handle if if there is a new issue or pullrequest in a known repo', () => {
		const firstRepo = createInterenalRepository({
			collapsed: false,
			read: false,
		});

		// Add a new issue to newly fetched data
		firstRepo.issues.push({ id: 'totalyNewID', read: false });

		const newFetchedRepositories = [
			firstRepo,
			createInterenalRepository({
				repoName: 'sideproject',
				issueID: 'issueID_2',
				pullID: 'pullID_2',
			}),
		];

		const response = transferUserStatus(newFetchedRepositories);

		// just need to make sure nothing broke with data missing
		expect(response[0].issues[0].read).toBe(true);
		expect(response[0].issues[1].read).toBe(false);
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
		expect(response[0].issues[0].read).toBe(true);
		expect(response[0].pullRequests[0].read).toBe(true);
	});

	it('should only set item as read if url contains github', () => {
		let response = setItemInRepoAsReadBasedOnUrl();
		expect(response).toBeFalsy();

		response = setItemInRepoAsReadBasedOnUrl('https://www.google.com');
		expect(response).toBeFalsy();
	});
});

describe('autoRemoveRepo', () => {
	it('should remove repo from settings', async () => {
		expect(quickStorage.settings.repos.length).toBe(4);
		expect(quickStorage.settings.repos[1].name).toBe('myotherrepo');

		autoRemoveRepo(1);
		expect(quickStorage.settings.repos.length).toBe(3);
		expect(quickStorage.settings.repos[1].name).toBe('mythirdrepo');
		// Make a simple asumption that we actually have all other settings
		expect(quickStorage.settings.token).toBe('myToken');

		expect(ports.messageAll).toHaveBeenCalledTimes(2);

		// Check that fetchData has been called
		expect(fetchDataFromAPI).toHaveBeenCalledTimes(1);
	});
});
