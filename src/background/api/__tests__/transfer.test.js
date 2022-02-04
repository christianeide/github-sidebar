import { transferUserStatus } from '../transfer.js';

import {
	createInternalRepositories,
	createRepoURL,
	createInternalRepositoryData,
} from '../../../../test/generate.js';
import { setupBackgroundTests } from '../../../../test/setup.js';

beforeEach(async () => {
	setupBackgroundTests({ read: true });
});

describe('transferUserStatus', () => {
	it('should fetch and transfer old data to new data', async () => {
		const newFetchedRepositories = createInternalRepositories(3, {
			collapsed: false,
		});

		const response = await transferUserStatus(newFetchedRepositories);
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

	it('should handle if repoddata dont contain the specified type (issue or pulllrequest)', async () => {
		const newFetchedRepositories = [
			{
				collapsed: true,
				url: createRepoURL(),
			},
		];

		const response = await transferUserStatus(newFetchedRepositories);

		// just need to make sure nothing broke with data missing
		expect(response).toBeTruthy();
	});

	it('should handle if if there is a new issue or pullrequest in a known repo', async () => {
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

		const response = await transferUserStatus(newFetchedRepositories);

		// just need to make sure nothing broke with data missing
		expect(response[0].issues[0].read).toBe(true);
		expect(response[0].issues[1].read).toBe(false);
	});
});
