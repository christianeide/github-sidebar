import { fetchDataFromAPI } from '../fetch.js';
import { createPullRequestsQuery } from '../graphql.js';

import { autoRemoveRepo } from '../utils.js';
jest.mock('../utils.js');

const userName = 'githubusername';
const userAddedRepo = { owner: userName, name: 'reponame' };
const numberOfItems = 4;
const sortBy = 'CREATED_AT';

const createSettings = (overrides) => {
	return {
		token: 'myToken',
		repos: [userAddedRepo, userAddedRepo],
		numberOfItems,
		sortBy,
		...overrides,
	};
};

const mockedResponseRepo = ({ name, login = userName, review = [] }) => {
	const date = '2021-01-01T01:02:03Z';
	return {
		name,
		owner: { login },
		url: `https://github.com/${login}/${name}`,
		issues: {
			totalCount: 5,
			edges: [
				{
					node: {
						author: {
							login,
						},
						comments: {
							totalCount: 4,
						},
						createdAt: date,
						id: 'issueid',
						title: 'My issue title',
						updatedAt: date,
						url: `https://github.com/${login}/${name}/issues/1`,
					},
				},
			],
		},
		pullRequests: {
			totalCount: 6,
			edges: [
				{
					node: {
						author: {
							login,
						},
						comments: {
							totalCount: 3,
						},
						createdAt: date,
						id: 'pullid',
						reviews: {
							nodes: review, // TODO : Legg til?
						},
						title: 'My pull request title',
						updatedAt: date,
						url: `https://github.com/christianeide/${name}/pull/11`,
					},
				},
			],
		},
	};
};

beforeEach(() => {
	global.fetch = jest.fn(() =>
		Promise.resolve({
			json: () =>
				Promise.resolve({
					data: {
						rateLimit: { limit: 1000 },
						viewer: { login: userName },
						repo1: mockedResponseRepo({
							name: 'github-sidebar',
						}),
						repo2: mockedResponseRepo({
							name: 'myawsomeproject',
							login: 'anotheruser',
						}),
						repo3: mockedResponseRepo({
							name: 'myotherproject',
							review: [{ state: 'APPROVED' }],
						}),
						repo4: mockedResponseRepo({
							name: 'myfinalproject',
						}),
					},
				}),
		})
	);
});

describe('handle errors', () => {
	it('should error if numberofitems is not defined', async () => {
		const numberOfItems = undefined;

		expect.assertions(1);
		try {
			await fetchDataFromAPI(createSettings({ numberOfItems }));
		} catch (e) {
			expect(e).toBeUndefined();
		}
	});

	it('should error if returned data contain errors', async () => {
		global.fetch = jest.fn().mockImplementationOnce(() =>
			Promise.resolve({
				json: () => Promise.resolve({ errors: [{ message: 'GithubError' }] }),
			})
		);

		expect.assertions(2);
		try {
			await fetchDataFromAPI(createSettings());
		} catch (e) {
			expect(e[0].title).toMatchInlineSnapshot(
				`"Error in API query to Github "`
			);
			expect(e[0].message).toMatchInlineSnapshot(`"GithubError"`);
		}
	});

	it('should remove repo if it is not found on github', async () => {
		global.fetch = jest.fn().mockImplementationOnce(() =>
			Promise.resolve({
				json: () =>
					Promise.resolve({
						errors: [
							{
								type: 'NOT_FOUND',
								message: 'GithubError',
								path: ['repo11'],
							},
						],
					}),
			})
		);

		expect.assertions(4);
		try {
			await fetchDataFromAPI(createSettings());
		} catch (e) {
			expect(autoRemoveRepo).toHaveBeenCalledTimes(1);
			expect(autoRemoveRepo).toHaveBeenCalledWith(11);
			expect(e[0].title).toMatchInlineSnapshot(
				`"Error in API query to Github "`
			);
			expect(e[0].message).toMatchInlineSnapshot(
				`"GithubError Will now autoremove repo from list."`
			);
		}
	});

	it('should error if returned data dont contain any data', async () => {
		global.fetch = jest.fn().mockImplementationOnce(() =>
			Promise.resolve({
				json: () => Promise.resolve({ noData: {}, message: 'My Error' }),
			})
		);

		expect.assertions(2);
		try {
			await fetchDataFromAPI(createSettings());
		} catch (e) {
			expect(e[0].title).toMatchInlineSnapshot(
				`"Could not reach Githubs API at this moment "`
			);
			expect(e[0].message).toMatchInlineSnapshot(`"My Error"`);
		}
	});

	it('should return ddefault error if result dont contain a message', async () => {
		global.fetch = jest.fn().mockImplementationOnce(() =>
			Promise.resolve({
				json: () => Promise.resolve({ noData: {} }),
			})
		);

		expect.assertions(1);
		try {
			await fetchDataFromAPI(createSettings());
		} catch (e) {
			expect(e[0].message).toMatchInlineSnapshot(`"Unknown error"`);
		}
	});

	it('should not return an error if fetch fails', async () => {
		global.fetch = jest.fn().mockImplementationOnce(() => Promise.reject({}));

		expect.assertions(1);
		try {
			await fetchDataFromAPI(createSettings());
		} catch (e) {
			expect(e).toBeUndefined();
		}
	});

	it('should return error if fetch fails and contain a response', async () => {
		global.fetch = jest.fn().mockImplementationOnce(() =>
			Promise.reject({
				message: 'My Error',
				response: { data: { message: 'My message' } },
			})
		);

		expect.assertions(2);
		try {
			await fetchDataFromAPI(createSettings());
		} catch (e) {
			expect(e[0].title).toMatchInlineSnapshot(`"My Error"`);
			expect(e[0].message).toMatchInlineSnapshot(`"My message"`);
		}
	});
});

describe('fetching', () => {
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

	it('should return repo data', async () => {
		let { newRepoData } = await fetchDataFromAPI(createSettings());

		expect(newRepoData).toBeInstanceOf(Array);
		expect(newRepoData.length).toBe(4);

		const firstRepo = newRepoData[0];
		expect(firstRepo.name).toBe('github-sidebar');
		expect(newRepoData[1].name).toBe('myawsomeproject');
		expect(newRepoData[2].name).toBe('myotherproject');
		expect(newRepoData[3].name).toBe('myfinalproject');

		expect(firstRepo.owner).toBe(userName);
		expect(firstRepo.url).toMatchInlineSnapshot(
			`"https://github.com/githubusername/github-sidebar"`
		);
		expect(firstRepo.collapsed).toBeTruthy();
		expect(firstRepo.totalItems.issues).toBe(5);
		expect(firstRepo.totalItems.pullRequests).toBe(6);

		expect(firstRepo.issues).toMatchInlineSnapshot(`
		Array [
		  Object {
		    "author": "githubusername",
		    "comments": 4,
		    "createdAt": "2021-01-01T01:02:03Z",
		    "id": "issueid",
		    "read": true,
		    "reviewStatus": null,
		    "title": "My issue title",
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
		    "id": "pullid",
		    "read": true,
		    "reviewStatus": null,
		    "title": "My pull request title",
		    "updatedAt": "2021-01-01T01:02:03Z",
		    "url": "https://github.com/christianeide/github-sidebar/pull/11",
		  },
		]
	`);
	});

	it('should set item to unread if not created by same user that has credentials to github', async () => {
		let { newRepoData } = await fetchDataFromAPI(createSettings());

		expect(newRepoData[1].pullRequests[0].read).toBeFalsy();
	});

	it('should return item reviewstatatus if any provided', async () => {
		let { newRepoData } = await fetchDataFromAPI(createSettings());

		expect(newRepoData[2].pullRequests[0].reviewStatus).toMatch('APPROVED');
	});
});
