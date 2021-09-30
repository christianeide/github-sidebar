import { hasUnreadItems, repoHasUnreadItems } from '../utils';
import {
	createInternalRepositories,
	createInternalRepositoryData,
} from '../../../../test/generate';

describe('hasUnreadItems', () => {
	it('should not show favicon if settings parameter is false', () => {
		const repositories = createInternalRepositories(2);
		let hasUnread = hasUnreadItems(repositories);
		expect(hasUnread).toBe(true);

		// Set all elements to read
		repositories[0].issues[0].read = true;
		repositories[0].pullRequests[0].read = true;
		repositories[0].pullRequests[1].read = true;
		repositories[1].issues[0].read = true;
		repositories[1].pullRequests[0].read = true;
		repositories[1].pullRequests[1].read = true;

		hasUnread = hasUnreadItems(repositories);
		expect(hasUnread).toBe(false);
	});
});

describe('repoHasUnreadItems', () => {
	it('should return false if issues and pullrequests is missing', () => {
		let repository = createInternalRepositoryData();
		delete repository.issues;
		delete repository.pullRequests;
		let hasUnread = repoHasUnreadItems(repository);

		expect(hasUnread).toBe(false);
	});

	it('should search through issues', () => {
		let repository = createInternalRepositoryData();
		repository.pullRequests[0].read = true;
		repository.pullRequests[1].read = true;
		let hasUnread = repoHasUnreadItems(repository);

		expect(hasUnread).toBe(true);
	});

	it('should search through pullrequests', () => {
		let repository = createInternalRepositoryData();
		repository.issues[0].read = true;
		let hasUnread = repoHasUnreadItems(repository);

		expect(hasUnread).toBe(true);
	});

	it('should return false if no elements are unread', () => {
		let repository = createInternalRepositoryData();
		repository.issues[0].read = true;
		repository.pullRequests[0].read = true;
		repository.pullRequests[1].read = true;
		let hasUnread = repoHasUnreadItems(repository);

		expect(hasUnread).toBe(false);
	});
});
