// List of reserved usernames and reponames
// from ovity / octotree
// https://github.com/ovity/octotree/
// https://github.com/ovity/octotree/blob/v3/src/adapters/github.js

const GH_RESERVED_USER_NAMES = [
	'settings',
	'orgs',
	'organizations',
	'site',
	'blog',
	'about',
	'explore',
	'styleguide',
	'showcases',
	'trending',
	'stars',
	'dashboard',
	'notifications',
	'search',
	'developer',
	'account',
	'pulls',
	'issues',
	'features',
	'contact',
	'security',
	'join',
	'login',
	'watching',
	'new',
	'integrations',
	'gist',
	'business',
	'mirrors',
	'open-source',
	'personal',
	'pricing',
	'sessions',
];
const GH_RESERVED_REPO_NAMES = ['followers', 'following', 'repositories'];

export function getCurrentPath() {
	const href = window.location.pathname;

	const urlItems = href.match(/([^/]+)\/([^/]+)/);
	if (!urlItems) {
		return;
	}

	const owner = urlItems[1];
	const name = urlItems[2];

	// Check if this is not a repository
	if (
		GH_RESERVED_USER_NAMES.includes(owner) ||
		GH_RESERVED_REPO_NAMES.includes(name)
	) {
		return;
	}

	return {
		name,
		owner,
	};
}

export function canAddRepository(currentRepos) {
	const validPage = getCurrentPath();

	if (!validPage) {
		return false;
	}

	// We dont allow users to add the same repository several times
	return !currentRepos.find(
		(currentRepo) => JSON.stringify(currentRepo) === JSON.stringify(validPage),
	);
}
