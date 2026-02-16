import { getCurrentPath, canAddRepository } from '../getPath';
import { createSettings } from '../../../../../test/generate';

beforeAll(() => {
	delete window.location;
});

const createlUrl = (subPath) => {
	return `https://www.github.com${subPath}`;
};

describe('getCurrentPath', () => {
	it('should not return anything if we dont have at least two subpaths', () => {
		window.location = new URL(createlUrl());
		expect(getCurrentPath()).toBeUndefined();

		window.location = new URL(createlUrl('/'));
		expect(getCurrentPath()).toBeUndefined();

		window.location = new URL(createlUrl('/path1'));
		expect(getCurrentPath()).toBeUndefined();

		window.location = new URL(createlUrl('/path1/'));
		expect(getCurrentPath()).toBeUndefined();
	});

	it('should not return anything if this is not a repository', () => {
		// Will not test all cases, just make sure we are testing against reserved names
		window.location = new URL(createlUrl('/settings/repo'));
		expect(getCurrentPath()).toBeUndefined();

		window.location = new URL(createlUrl('/owner/followers'));
		expect(getCurrentPath()).toBeUndefined();
	});

	it('should return name and owner from path', () => {
		window.location = new URL(createlUrl('/username/reponame'));
		expect(getCurrentPath()).toEqual({ name: 'reponame', owner: 'username' });

		window.location = new URL(createlUrl('/username/reponame/'));
		expect(getCurrentPath()).toEqual({ name: 'reponame', owner: 'username' });

		window.location = new URL(createlUrl('/username/reponame/subpath3'));
		expect(getCurrentPath()).toEqual({ name: 'reponame', owner: 'username' });
	});
});

describe('canAddrepository', () => {
	it('should return false if this is not a repo', () => {
		const repos = createSettings().repos;
		window.location = new URL(createlUrl());
		expect(canAddRepository(repos)).toBe(false);
	});

	it('should return false if repo already is added', () => {
		const repos = createSettings().repos;
		window.location = new URL(createlUrl('/githubusername/reponame'));
		expect(canAddRepository(repos)).toBe(false);
	});

	it('should return false if repo already is added', () => {
		const repos = createSettings().repos;
		window.location = new URL(createlUrl('/githubusername/newrepo'));
		expect(canAddRepository(repos)).toBe(true);
	});
});
