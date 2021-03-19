import { fetchData, apiErrors } from '../fetch.js';
import { quickStorage } from '../../settings/';
import { createPullRequestsQuery } from '../index.js';
import { toggleRead } from '../../lib/';

import { autoRemoveRepo } from '../remove';
jest.mock('../remove');
import * as ports from '../../lib/ports';
jest.mock('../../lib/ports');

import {
	createSettings,
	createRateLimit,
	createRepositoryData,
	mockFetchReject,
	mockFetchResolve,
	defaultRepoName,
	createExternalRespositories,
	createRepoURL,
} from '../../../../test/generate.js';
import { setupBackgroundTests } from '../../../../test/setup.js';

beforeEach(async () => {
	setupBackgroundTests();

	ports.sendToAllTabs.mockClear();
});

describe('fetchData', () => {
	it('should not fetch if settings or token is missing', async () => {
		// make sure it cheks for settings
		quickStorage.settings = undefined;
		await fetchData();
		expect(global.fetch).not.toHaveBeenCalled();

		// Make sure it cheks for token
		quickStorage.settings = { someProp: '' };
		await fetchData();
		expect(global.fetch).not.toHaveBeenCalled();

		// Make sure token actuallly have a value
		quickStorage.settings = { someProp: '', token: '' };
		await fetchData();
		expect(global.fetch).not.toHaveBeenCalled();

		// set settings to undefined so we can recreate settings
		quickStorage.settings = undefined;
	});

	it('should fetch and transfer old data to new data', async () => {
		await fetchData();

		expect(ports.sendToAllTabs).toHaveBeenNthCalledWith(1, { loading: true });

		// Make sure repositories and rateLimit have been set
		expect(chrome.storage.local.set).toHaveBeenCalledTimes(2);

		expect(ports.sendToAllTabs).toHaveBeenNthCalledWith(2, {
			repositories: createRepositoryData().internal,
			rateLimit: createRateLimit(),
			loading: false,
		});
	});

	it('should send error to user if github cant be reached', async () => {
		mockFetchReject({
			message: 'GithubError1',
			response: { data: { message: 'Github message1' } },
		});

		await fetchData();

		expect(ports.sendToAllTabs).toHaveBeenNthCalledWith(2, {
			errors: [
				{
					message: 'Github message1',
					title: 'GithubError1',
					time: expect.any(Number),
				},
			],
			loading: false,
		});
	});

	it('should not send errors to user if err-message is missing', async () => {
		mockFetchReject(new Error());

		await fetchData();

		// Expect sendToAllTabs to only have been called once, not twice
		expect(ports.sendToAllTabs).toHaveBeenCalledTimes(1);
	});

	it('should error if numberofitems is not defined', async () => {
		quickStorage.settings.numberOfItems = undefined;

		await fetchData();

		expect(global.fetch).not.toHaveBeenCalled();

		// Expect sendToAllTabs to only have been called once, not twice
		expect(ports.sendToAllTabs).toHaveBeenCalledTimes(1);
	});

	it('should error if returned data contain errors', async () => {
		mockFetchResolve({ errors: [{ message: 'GithubError2' }] });

		await fetchData();

		expect(
			ports.sendToAllTabs.mock.calls[1][0].errors[0].message
		).toMatchInlineSnapshot(`"GithubError2"`);
		expect(
			ports.sendToAllTabs.mock.calls[1][0].errors[0].title
		).toMatchInlineSnapshot(`"Error in API query to Github"`);
	});

	it('should remove repo if it is not found on github', async () => {
		mockFetchResolve({
			errors: [
				{
					type: 'NOT_FOUND',
					message: 'GithubError',
					path: ['repo11'],
				},
			],
		});

		await fetchData();

		expect(autoRemoveRepo).toHaveBeenCalledTimes(1);
		expect(autoRemoveRepo).toHaveBeenCalledWith(11);

		expect(
			ports.sendToAllTabs.mock.calls[1][0].errors[0].message
		).toMatchInlineSnapshot(
			`"GithubError: Will now autoremove repo from list."`
		);
		expect(
			ports.sendToAllTabs.mock.calls[1][0].errors[0].title
		).toMatchInlineSnapshot(`"Error in API query to Github"`);
	});

	it('should error if returned data dont contain any data', async () => {
		mockFetchResolve({ noData: {}, message: 'My Error' });

		await fetchData();

		expect(
			ports.sendToAllTabs.mock.calls[1][0].errors[0].message
		).toMatchInlineSnapshot(`"My Error"`);
		expect(
			ports.sendToAllTabs.mock.calls[1][0].errors[0].title
		).toMatchInlineSnapshot(`"Could not reach Githubs API at this moment"`);
	});

	it('should return default error if result dont contain a message', async () => {
		mockFetchResolve({ noData: {} });

		await fetchData();
		expect(
			ports.sendToAllTabs.mock.calls[1][0].errors[0].message
		).toMatchInlineSnapshot(`"Unknown error"`);
	});

	it('should not return an error if fetch fails', async () => {
		mockFetchReject({});

		await fetchData();

		// Expect sendToAllTabs to only have been called once, not twice
		expect(ports.sendToAllTabs).toHaveBeenCalledTimes(1);
		expect(apiErrors.get()).toEqual([]);
	});

	it('should return repo data', async () => {
		await fetchData();

		expect(ports.sendToAllTabs).toHaveBeenCalledTimes(2);

		const repositories = ports.sendToAllTabs.mock.calls[1][0].repositories;
		expect(repositories).toBeInstanceOf(Array);
		expect(repositories.length).toBe(4);

		const firstRepo = repositories[0];
		expect(firstRepo.name).toBe('github-sidebar');
		expect(repositories[1].name).toBe(`${defaultRepoName}_2`);
		expect(repositories[2].name).toBe(`${defaultRepoName}_3`);
		expect(repositories[3].name).toBe(`${defaultRepoName}_4`);

		expect(firstRepo.url).toMatchInlineSnapshot(
			`"https://github.com/githubusername/github-sidebar"`
		);
		expect(firstRepo.collapsed).toBeTruthy();
		expect(firstRepo.totalItems.issues).toBe(1);
		expect(firstRepo.totalItems.pullRequests).toBe(2);

		expect(firstRepo.issues).toMatchInlineSnapshot(`
		Array [
		  Object {
		    "author": "githubusername",
		    "comments": 2,
		    "createdAt": "2021-01-01T01:02:03Z",
		    "id": "issueID",
		    "read": false,
		    "reviewStatus": null,
		    "title": "Issue title 1",
		    "updatedAt": "2021-01-01T01:02:03Z",
		    "url": "https://github.com/githubusername/github-sidebar/issues/1",
		  },
		]
	`);

		expect(firstRepo.pullRequests).toMatchInlineSnapshot(`
		Array [
		  Object {
		    "author": "githubusername",
		    "comments": 3,
		    "createdAt": "2021-01-01T01:02:03Z",
		    "id": "pullID",
		    "read": false,
		    "reviewStatus": "APPROVED",
		    "title": "Pull title 1",
		    "updatedAt": "2021-01-01T01:02:03Z",
		    "url": "https://github.com/githubusername/github-sidebar/pull/2",
		  },
		  Object {
		    "author": "githubusername",
		    "comments": 4,
		    "createdAt": "2021-01-01T01:02:03Z",
		    "id": "pullID_2",
		    "read": false,
		    "reviewStatus": null,
		    "title": "Pull title 2",
		    "updatedAt": "2021-01-01T01:02:03Z",
		    "url": "https://github.com/githubusername/github-sidebar/pull/3",
		  },
		]
	`);
	});

	it('should return null for reviewstatatus if not provided', async () => {
		await fetchData();

		expect(
			ports.sendToAllTabs.mock.calls[1][0].repositories[0].pullRequests[1]
				.reviewStatus
		).toBe(null);
	});

	it('should return item reviewstatus if  provided', async () => {
		await fetchData();

		expect(
			ports.sendToAllTabs.mock.calls[1][0].repositories[2].pullRequests[0]
				.reviewStatus
		).toBe('APPROVED');
	});

	it('should set item to unread if not created by same user that has credentials to github', async () => {
		await fetchData();

		expect(
			ports.sendToAllTabs.mock.calls[1][0].repositories[0].pullRequests[0].read
		).toBe(false);
	});

	it('should set item to read if created by same user that has credentials to github', async () => {
		mockFetchResolve(createExternalRespositories(4, { issues: 2 }));

		await fetchData();

		expect(
			ports.sendToAllTabs.mock.calls[1][0].repositories[0].issues.length
		).toBe(2);
		expect(
			ports.sendToAllTabs.mock.calls[1][0].repositories[0].issues[0].read
		).toBe(false);
		expect(
			ports.sendToAllTabs.mock.calls[1][0].repositories[0].issues[1].read
		).toBe(true);
	});

	it('should set item to unread if changed since last fetch to ggithub', async () => {
		// DISCLAIMER: This is a pretty huge test to be able to set this scenario up

		let externalRepoData = createExternalRespositories(1, {
			issues: 4,
			issueAuthor: 'anotherAuthor',
		});

		// First we do a normal fetch to the api with the curent data
		mockFetchResolve(externalRepoData);

		await fetchData();

		let repository = ports.sendToAllTabs.mock.calls[1][0].repositories[0];

		expect(repository.totalItemsNumber).toBe(4);
		expect(repository.issues[0].read).toBe(false);

		// Then we toggle all items to read before next test
		let request = {
			type: 'toggleRead',
			repo: createRepoURL(),
			status: true,
		};
		await toggleRead(request);

		ports.sendToAllTabs.mockClear();

		// Then we do a new fetch, but this time the last issue is removed,
		// and a issue with a new ID is created. This new element should be unread
		mockFetchResolve(
			createExternalRespositories(4, {
				issues: 4,
				issueAuthor: 'anotherAuthor',
				issuesMaxNumber: 5,
			})
		);

		// We are showing 4 issues at a time, so we will remove the last item from the array,
		// and then add a new issue at the start of the array.
		// This new item has a new id and number
		const newRepo = externalRepoData.data.repos0.issues.edges.pop();
		const copyOfLastRepo = { ...newRepo, node: { ...newRepo.node } };
		newRepo.node.id = 'newID';
		newRepo.node.number = 5;
		externalRepoData.data.repos0.issues.edges.unshift(newRepo);
		// Set max items to one more than before
		externalRepoData.data.repos0.issuesMaxNumber.edges[0].node.number = 5;

		ports.sendToAllTabs.mockClear();
		mockFetchResolve(externalRepoData);
		await fetchData();

		repository = ports.sendToAllTabs.mock.calls[1][0].repositories[0];
		expect(repository.totalItemsNumber).toBe(5);
		expect(repository.issues[0].id).toBe('newID');
		expect(repository.issues[0].read).toBe(false);
		expect(repository.issues[1].id).toBe('issueID');
		expect(repository.issues[1].read).toBe(true);
		expect(repository.issues[2].id).toBe('issueID_2');
		expect(repository.issues[2].read).toBe(true);
		expect(repository.issues[3].id).toBe('issueID_3');
		expect(repository.issues[3].read).toBe(true);

		// We then delete the new item and bring back the "old" item.
		// Be default this should now be read = false, but with counter
		// logic this should now be read = true
		// Set to another id so data is not copied from quickstorage
		copyOfLastRepo.node.id = 'unknownID';
		externalRepoData.data.repos0.issues.edges.shift();
		externalRepoData.data.repos0.issues.edges.push(copyOfLastRepo);

		ports.sendToAllTabs.mockClear();
		mockFetchResolve(externalRepoData);
		await fetchData();

		repository = ports.sendToAllTabs.mock.calls[1][0].repositories[0];
		expect(repository.totalItemsNumber).toBe(5);
		expect(repository.issues[0].id).toBe('issueID');
		expect(repository.issues[0].read).toBe(true);
		expect(repository.issues[1].id).toBe('issueID_2');
		expect(repository.issues[1].read).toBe(true);
		expect(repository.issues[2].id).toBe('issueID_3');
		expect(repository.issues[2].read).toBe(true);
		expect(repository.issues[3].id).toBe('unknownID');
		expect(repository.issues[3].read).toBe(true);
	});

	it('should set all elements inside a newly added repo as read', async () => {
		// First we fetch data. By ddefault we will receive 4 repos
		await fetchData();

		// Do a new fetch, but this time with 5 repos
		let externalRepoData = createExternalRespositories(
			5,
			{},
			{},
			{},
			{},
			{
				issueAuthor: 'anotherAuthor',
			}
		);

		mockFetchResolve(externalRepoData);
		ports.sendToAllTabs.mockClear();
		await fetchData();

		let repository = ports.sendToAllTabs.mock.calls[1][0].repositories[4];
		expect(repository.issues[0].read).toBe(true);
		expect(repository.pullRequests[0].read).toBe(true);
		expect(repository.pullRequests[1].read).toBe(true);
	});
});

describe('fetching in fetchDataFromAPI', () => {
	it('should call fetch with the querydata', async () => {
		await fetchData();

		expect(global.fetch).toHaveBeenCalledTimes(1);
		const { repos, numberOfItems, sortBy, token } = createSettings();
		expect(global.fetch).toHaveBeenCalledWith(
			'https://api.github.com/graphql',
			{
				method: 'post',
				headers: {
					Authorization: `Bearer ${token}`,
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					query: createPullRequestsQuery(repos, numberOfItems, sortBy),
				}),
			}
		);
	});
});
