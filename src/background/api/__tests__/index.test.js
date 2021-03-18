import { fetchDataFromAPI, fetchData, apiErrors } from '../index.js';
import { quickStorage } from '../../settings/quickStorage.js';
import { createPullRequestsQuery } from '../graphql.js';
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

	// it('should return repo data', async () => {
	// 	let { newRepoData } = await fetchData(createSettings());

	// 	expect(newRepoData).toBeInstanceOf(Array);
	// 	expect(newRepoData.length).toBe(4);

	// 	const firstRepo = newRepoData[0];
	// 	expect(firstRepo.name).toBe('github-sidebar');
	// 	expect(newRepoData[1].name).toBe('myawsomeproject');
	// 	expect(newRepoData[2].name).toBe('myotherproject');
	// 	expect(newRepoData[3].name).toBe('myfinalproject');

	// 	expect(firstRepo.owner).toBe(defaultUserName);
	// 	expect(firstRepo.url).toMatchInlineSnapshot(
	// 		`"https://github.com/githubusername/github-sidebar"`
	// 	);
	// 	expect(firstRepo.collapsed).toBeTruthy();
	// 	expect(firstRepo.totalItems.issues).toBe(5);
	// 	expect(firstRepo.totalItems.pullRequests).toBe(6);

	// 	expect(firstRepo.issues).toMatchInlineSnapshot(`
	// 	Array [
	// 	  Object {
	// 	    "author": "githubusername",
	// 	    "comments": 4,
	// 	    "createdAt": "2021-01-01T01:02:03Z",
	// 	    "id": "issueid",
	// 	    "read": true,
	// 	    "reviewStatus": null,
	// 	    "title": "My issue title",
	// 	    "updatedAt": "2021-01-01T01:02:03Z",
	// 	    "url": "https://github.com/githubusername/github-sidebar/issues/1",
	// 	  },
	// 	]
	// `);

	// 	expect(firstRepo.pullRequests).toMatchInlineSnapshot(`
	// 	Array [
	// 	  Object {
	// 	    "author": "githubusername",
	// 	    "comments": 3,
	// 	    "createdAt": "2021-01-01T01:02:03Z",
	// 	    "id": "pullid",
	// 	    "read": true,
	// 	    "reviewStatus": null,
	// 	    "title": "My pull request title",
	// 	    "updatedAt": "2021-01-01T01:02:03Z",
	// 	    "url": "https://github.com/githubusername/github-sidebar/pull/11",
	// 	  },
	// 	]
	// `);
	// });

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
		).toBeFalsy();
	});

	// it.only('should set item to read if created by same user that has credentials to github', async () => {
	// 	await fetchData();

	// 	expect(
	// 		ports.sendToAllTabs.mock.calls[1][0].repositories[0].issues[1].read
	// 	).toBeTruthy();
	// });

	// it('should set item to unread if changed since last fetch to ggithub', async () => {
	// 	// console.log('🚀 => it => createGithubResponse()', createGithubResponse());
	// 	global.fetch = jest.fn().mockImplementationOnce(() =>
	// 		Promise.resolve({
	// 			json: () =>
	// 				Promise.resolve({
	// 					data: {
	// 						rateLimit: createRateLimit(),
	// 						viewer: { login: defaultUserName },
	// 						repo1: createGithubResponseRepository({
	// 							repoName: 'github-sidebar',
	// 						}),
	// 					},
	// 				}),
	// 		})
	// 	);
	// 	let { newRepoData } = await fetchDataFromAPI(createSettings());

	// 	// expect(newRepoData[1].pullRequests[0].read).toBeFalsy();
	// });
});

describe('fetching in fetchDataFromAPI', () => {
	it('should call fetch with the querydata', async () => {
		await fetchDataFromAPI(createSettings());

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
