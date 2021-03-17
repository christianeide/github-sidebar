import { quickStorage } from '../settings/quickStorage.js';
import { autoFetch } from '../background.js';
import * as ports from './ports';
import { fetchData } from '../api/index.js';

export function init(port) {
	return quickStorage
		.getStorage()
		.then(({ settings, repositories, rateLimit }) => {
			// Return initial data
			port.postMessage({
				settings,
				repositories,
				rateLimit,
			});

			// If autofetching is not running, we will start it up again
			if (!autoFetch.timer) {
				autoFetch.start(settings.autoRefresh);
			}

			// Add port to portmanagment
			ports.add(port);

			// Always fetch new data when we have a init from a new contentscript
			fetchData();
		});
}

export function toggleRead(request) {
	const repositories = quickStorage.repositories.map((repo) => {
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
	quickStorage.repositories = repositories;
	ports.sendToAllTabs({ repositories });
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

export function toggleCollapsed(request) {
	const repositories = quickStorage.repositories.map((repo) => {
		if (repo.url === request.url) {
			return { ...repo, collapsed: !repo.collapsed };
		}

		return repo;
	});

	// Save and distribute
	quickStorage.repositories = repositories;
	ports.sendToAllTabs({ repositories });
}

export function setItemInRepoAsReadBasedOnUrl(url) {
	if (!url || url.indexOf('github.com') === -1) {
		return;
	}
	// Loop through all repos
	return quickStorage?.repositories?.map((repo) => {
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
