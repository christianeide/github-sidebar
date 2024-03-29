import { defaultSettings } from '../src/background/settings/';

export const defaultUserName = 'githubusername';
export const defaultRepoName = 'github-sidebar';
const numberOfItems = 4;
const sortBy = 'CREATED_AT';
const date = '2021-01-01T01:02:03Z';

export function createSettings(overrides) {
	return {
		...defaultSettings,
		token: 'myToken',
		numberOfItems,
		sortBy,
		repos: [
			{ name: 'reponame', owner: defaultUserName },
			{ name: 'myotherrepo', owner: defaultUserName },
			{ name: 'mythirdrepo', owner: defaultUserName },
			{ name: 'projectrepo', owner: 'differentUser' },
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
	const {
		userName = defaultUserName,
		repoName = defaultRepoName,
		subPath = '',
	} = options;
	return `https://github.com/${userName}/${repoName}${subPath}`;
}

export function mockFetchReject(data) {
	global.fetch = jest.fn().mockImplementationOnce(() => Promise.reject(data));
}

export function mockFetchResolve(data) {
	global.fetch = jest.fn().mockImplementationOnce(() =>
		Promise.resolve({
			json: () => Promise.resolve(data),
		})
	);
}

export function createQuickStorage(options) {
	return {
		repositories: createInternalRepositories(4, options),
		rateLimit: createRateLimit(),
		settings: createSettings(),
	};
}

const defaultRepositoryOptions = {
	repoName: defaultRepoName,
	login: defaultUserName,
	issueID: 'issueID',
	issues: 1,
	pullID: 'pullID',
	collapsed: true,
	read: false,
	review: [],
};

export function createRepositoryData() {
	return {
		internal: createInternalRepositories(),
		external: createExternalRespositories(),
	};
}

const appendNumber = (prefix, index) =>
	index === 0 ? prefix : `${prefix}_${index + 1}`;

export function createExternalRespositories(numberOfRepos = 4, ...args) {
	let repos = {};
	[...Array(numberOfRepos)].map((_, i) => {
		repos[`repos${i}`] = createExternalRepositoryData({
			...args[i],
			repoName: appendNumber(defaultRepoName, i),
		});
	});
	return {
		data: {
			rateLimit: createRateLimit(),
			viewer: { login: defaultUserName },
			...repos,
		},
	};
}

export function createInternalRepositories(numberOfRepos = 4, ...args) {
	return [...Array(numberOfRepos)].map((_, i) => {
		return createInternalRepositoryData({
			...args[i],
			repoName: appendNumber(defaultRepoName, i),
		});
	});
}

function createExternalRepositoryData(options) {
	const {
		repoName,
		login,
		issueID,
		pullID,
		issues,
		issueAuthor = login,
		issuesMaxNumber = issues,
	} = {
		...defaultRepositoryOptions,
		...options,
	};

	return {
		name: repoName,
		owner: { login: issueAuthor },
		url: createRepoURL({ userName: login, repoName }),
		issuesMaxNumber: {
			edges: [
				{
					node: {
						number: issuesMaxNumber,
					},
				},
			],
		},
		issues: {
			totalCount: issues,
			edges: [...Array(issues)].map((_, i) => {
				return {
					node: {
						author: {
							login: issueAuthor,
						},
						comments: {
							totalCount: 2,
						},
						createdAt: date,
						id: appendNumber(issueID, i),
						title: `Issue title ${i + 1}`,
						updatedAt: date,
						number: issues,
						url: createRepoURL({
							userName: login,
							repoName,
							subPath: '/issues/1',
						}),
					},
				};
			}),
		},
		pullRequestsMaxNumber: {
			edges: [
				{
					node: {
						number: 2,
					},
				},
			],
		},
		pullRequests: {
			totalCount: 2,
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
						id: pullID,
						reviews: { nodes: [{ state: 'APPROVED' }] },
						title: 'Pull title 1',
						updatedAt: date,
						number: 1,
						url: createRepoURL({
							userName: login,
							repoName,
							subPath: '/pull/2',
						}),
					},
				},
				{
					node: {
						author: {
							login,
						},
						comments: {
							totalCount: 4,
						},
						createdAt: date,
						id: `${pullID}_2`,
						reviews: { nodes: [] },
						title: 'Pull title 2',
						updatedAt: date,
						number: 2,
						url: createRepoURL({
							userName: login,
							repoName,
							subPath: '/pull/3',
						}),
					},
				},
			],
		},
	};
}

export function createInternalRepositoryData(options) {
	const {
		collapsed,
		repoName,
		login,
		issueID,
		read,
		pullID,
		issueAuthor = login,
	} = {
		...defaultRepositoryOptions,
		...options,
	};

	return {
		collapsed,
		name: repoName,
		owner: login,
		url: createRepoURL({
			userName: login,
			repoName,
		}),
		totalItemsNumber: 2,
		totalItems: {
			issues: 1,
			pullRequests: 2,
		},
		issues: [
			{
				author: issueAuthor,
				comments: 2,
				createdAt: date,
				id: issueID,
				read,
				reviewStatus: null,
				title: 'Issue title 1',
				updatedAt: date,
				url: createRepoURL({
					userName: login,
					repoName,
					subPath: '/issues/1',
				}),
			},
		],

		pullRequests: [
			{
				author: login,
				comments: 3,
				createdAt: date,
				id: pullID,
				read,
				reviewStatus: 'APPROVED',
				title: 'Pull title 1',
				updatedAt: date,
				url: createRepoURL({
					userName: login,
					repoName,
					subPath: '/pull/2',
				}),
			},
			{
				author: login,
				comments: 4,
				createdAt: date,
				id: `${pullID}_2`,
				read: false,
				reviewStatus: null,
				title: 'Pull title 2',
				updatedAt: date,
				url: createRepoURL({
					userName: login,
					repoName,
					subPath: '/pull/3',
				}),
			},
		],
	};
}
