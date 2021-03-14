import defaultSettings from '../src/background/js/defaultSettings.json';

export const defaultUserName = 'githubusername';
export const defaultRepoName = 'github-sidebar';
const numberOfItems = 4;
const sortBy = 'CREATED_AT';
const date = '2021-01-01T01:02:03Z';

export function createChromePort(request = { type: null }) {
	return {
		postMessage: jest.fn(),
		onDisconnect: { addListener: jest.fn() },
		onMessage: {
			addListener: jest.fn((cb) => {
				return cb(request);
			}),
		},
	};
}

export function createSettings(overrides) {
	return {
		...defaultSettings,
		token: 'myToken',
		numberOfItems,
		sortBy,
		repos: [
			{ owner: defaultUserName, name: 'reponame' },
			{ owner: defaultUserName, name: 'myotherrepo' },
			{ owner: defaultUserName, name: 'mythirdrepo' },
			{ owner: 'differentUser', name: 'projectrepo' },
		],
		...overrides,
	};
}

export function createRateLimit(overrides) {
	return {
		limit: 5000,
		remaining: 4930,
		resetAt: '2022-01-01T01:02:03Z',
		...overrides,
	};
}

export function createRepoURL(options = {}) {
	const { userName = defaultUserName, repoName = defaultRepoName } = options;
	return `https://github.com/${userName}/${repoName}`;
}

export function createInterenalRepository(options = {}) {
	const {
		repoName = defaultRepoName,
		login = defaultUserName,
		issueID = 'issueID',
		pullID = 'pullID',
		collapsed = true,
		read = true,
	} = options;

	return {
		collapsed,
		name: repoName,
		owner: login,
		url: `https://github.com/${login}/${repoName}`,
		issues: [
			{
				author: login,
				comments: 0,
				createdAt: date,
				id: issueID,
				read,
				reviewStatus: null,
				title: 'Issue title 1',
				updatedAt: date,
				url: `https://github.com/${login}/${repoName}/issues/1`,
			},
		],

		pullRequests: [
			{
				author: login,
				comments: 0,
				createdAt: date,
				id: pullID,
				read,
				reviewStatus: null,
				title: 'Pull title 1',
				updatedAt: date,
				url: `https://github.com/${login}/${repoName}/pull/10`,
			},
			{
				author: login,
				comments: 2,
				createdAt: date,
				id: `${pullID}_2`,
				read: false,
				reviewStatus: null,
				title: 'Pull title 2',
				updatedAt: date,
				url: `https://github.com/${login}/${repoName}/pull/11`,
			},
		],
		totalItems: {
			issues: 1,
			pullRequests: 10,
		},
	};
}

export function createInternalRepositories(numberOfRepos = 4, ...args) {
	return [...Array(numberOfRepos)].map((_, i) => {
		const appendNumber = (prefix) => (i === 0 ? prefix : `prefix_${i + 1}`);

		return createInterenalRepository({
			repoName: appendNumber(defaultRepoName),
			issueID: appendNumber('issueID'),
			pullID: appendNumber('pullID'),
			...args[i],
		});
	});
}

export function createQuickStorage() {
	return {
		repositories: createInternalRepositories(),
		rateLimit: createRateLimit(),
		settings: createSettings(),
	};
}

export function createGithubResponseRepository(options = {}) {
	const {
		repoName = defaultRepoName,
		login = defaultUserName,
		review = [],
	} = options;

	return {
		name: repoName,
		owner: { login },
		url: `https://github.com/${login}/${repoName}`,
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
						url: `https://github.com/${login}/${repoName}/issues/1`,
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
							nodes: review,
						},
						title: 'My pull request title',
						updatedAt: date,
						url: `https://github.com/${login}/${repoName}/pull/11`,
					},
				},
			],
		},
	};
}

export function createGithubResponse() {
	return {
		data: {
			rateLimit: createRateLimit(),
			viewer: { login: defaultUserName },
			repo1: createGithubResponseRepository({
				repoName: 'github-sidebar',
			}),
			repo2: createGithubResponseRepository({
				repoName: 'myawsomeproject',
				login: 'anotheruser',
			}),
			repo3: createGithubResponseRepository({
				repoName: 'myotherproject',
				review: [{ state: 'APPROVED' }],
			}),
			repo4: createGithubResponseRepository({
				repoName: 'myfinalproject',
			}),
		},
	};
}
