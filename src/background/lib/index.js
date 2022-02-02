import { quickStorage } from '../settings/';
import { setAlarm } from '../background';
import { fetchData } from '../api/';

export async function init(sendResponse) {
	const { settings, repositories, rateLimit } = await quickStorage.getStorage();

	// Return initial data to on unit
	sendResponse({
		settings,
		repositories,
		rateLimit,
	});
	// If autofetching is not running, we will start it up again
	setAlarm.start(settings.autoRefresh);
	// Always fetch new data when we have a init from a new contentscript
	fetchData();
}

export function sendToAllTabs(message) {
	chrome.tabs.query({ url: 'https://github.com/*' }, (tabs) => {
		// If we dont have any tabs and by that any content script,
		// then we will stop the interval
		if (!tabs || tabs.length === 0) {
			return setAlarm.stop();
		}

		tabs.map((tab) => {
			chrome.tabs.sendMessage(tab.id, message);
		});
	});
}

export async function toggleRead(request) {
	const storedRepos = await quickStorage.getRepositories();
	const repositories = storedRepos.map((repo) => {
		return {
			...repo,
			issues: setArrayItemReadStatus(repo.issues, repo.url, request),
			pullRequests: setArrayItemReadStatus(
				repo.pullRequests,
				repo.url,
				request
			),
		};
	});

	// Save and distribute
	quickStorage.setRepositories(repositories);
	sendToAllTabs({ repositories });
}

export function setArrayItemReadStatus(type, repoURL, request) {
	return type.map((item) => {
		// If single item
		if (request.id) {
			if (item && item.id === request.id) {
				return { ...item, read: !item.read };
			}

			// TODO: Consider changing this to request.url instead
			// todo: to make it similar between messages
			// If repo
		} else if (request.repo) {
			if (repoURL === request.repo) {
				return { ...item, read: request.status };
			}

			// if all
		} else {
			return { ...item, read: request.status };
		}

		return item;
	});
}

export async function toggleCollapsed(request) {
	const storedRepos = await quickStorage.getRepositories();

	const repositories = storedRepos.map((repo) => {
		if (repo.url === request.url) {
			return { ...repo, collapsed: !repo.collapsed };
		}

		return repo;
	});

	// Save and distribute
	quickStorage.setRepositories(repositories);
	sendToAllTabs({ repositories });
}

export async function setItemInRepoAsReadBasedOnUrl(url) {
	if (!url || url.indexOf('github.com') === -1) {
		return;
	}

	const storedRepos = await quickStorage.getRepositories();

	// Loop through all repos
	return storedRepos?.map((repo) => {
		const issues = findItemByURL(repo.issues, url);
		const pullRequests = findItemByURL(repo.pullRequests, url);

		return {
			...repo,
			issues,
			pullRequests,
		};
	});
}

function findItemByURL(type, url) {
	return type.map((item) => {
		if (item.url !== url) {
			return item;
		}

		return { ...item, read: true };
	});
}
