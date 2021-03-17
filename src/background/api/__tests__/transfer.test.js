import { quickStorage } from '../../settings/quickStorage.js';
import { transferUserStatus } from '../transfer.js';

import {
	createGithubResponse,
	createInternalRepositories,
	createRepoURL,
	createQuickStorage,
	createInternalRepositoryData,
} from '../../../../test/generate.js';

beforeEach(async () => {
	global.fetch = jest.fn(() =>
		Promise.resolve({
			json: () => Promise.resolve(createGithubResponse()),
		})
	);

	// TODO: Do this in generate-file? Or new setup-file?

	// Before each test we calll getStoragge() and do a basic setup
	// This will get data from storage, so we mock the return data
	// At the same time we mock the return data from fetch as well.
	// Finally we clear any calls theese mocks have received
	chrome.storage.local.get.mockImplementation((message, callback) => {
		callback(createQuickStorage({ read: true }));
	});

	// Do a initial setup for storage
	quickStorage.settings = undefined;
	quickStorage.repositories = undefined;
	quickStorage.rateLimit = undefined;
	await quickStorage.getStorage();
	chrome.storage.local.set.mockClear();
});

describe('transferUserStatus', () => {
	it('should fetch and transfer old data to new data', async () => {
		const newFetchedRepositories = createInternalRepositories(3, {
			collapsed: false,
		});

		const response = transferUserStatus(newFetchedRepositories);
		// console.log('🚀 => it => newFetchedRepositories', newFetchedRepositories);

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
		const firstRepo = createInternalRepositoryData({
			collapsed: false,
			read: false,
		});

		// Add a new issue to newly fetched data
		firstRepo.issues.push({ id: 'totalyNewID', read: false });

		const newFetchedRepositories = [
			firstRepo,
			createInternalRepositoryData({
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
