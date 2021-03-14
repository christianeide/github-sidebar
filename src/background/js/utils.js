import { quickStorage } from './quickStorage';
import { autoFetch } from '../background.js';
import defaultSettings from './defaultSettings.json';
import * as ports from './ports';
import { fetchDataFromAPI } from './fetch.js';

const MIMIMUMREFRESHPERIOD = 15;
export let errors = [];

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

export function sendToAllTabs(data) {
	ports.messageAll(data);
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

export function toggleCollapsed(request) {
	const repositories = quickStorage.repositories.map((repo) => {
		if (repo.url === request.url) {
			return { ...repo, collapsed: !repo.collapsed };
		}

		return repo;
	});

	// Save and distribute
	quickStorage.repositories = repositories;
	sendToAllTabs({ repositories });
}

export function transferUserStatus(repositories) {
	// Loop through all new repositories to copy settings from the old repodata
	return repositories.map((newRepo) => {
		const oldRepo = quickStorage.repositories.find(
			(oldRepo) => oldRepo.url === newRepo.url
		);

		if (!oldRepo) {
			return newRepo;
		}

		// Copy collapsed status
		const collapsed = oldRepo.collapsed;

		const issues = tranferReadStatusOfItem(newRepo.issues, oldRepo.issues);
		const pullRequests = tranferReadStatusOfItem(
			newRepo.pullRequests,
			oldRepo.pullRequests
		);

		return {
			...newRepo,
			collapsed,
			issues,
			pullRequests,
		};
	});
}

function tranferReadStatusOfItem(newFetchedRepo, oldRepo) {
	if (!oldRepo || !newFetchedRepo) {
		return newFetchedRepo;
	}

	return newFetchedRepo.map((newItem) => {
		const newItemsOldRepoData = oldRepo.find((old) => old.id === newItem.id);

		if (!newItemsOldRepoData) {
			return newItem;
		}

		return { ...newItem, read: newItemsOldRepoData.read };
	});
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

export function saveSettings(newSettings) {
	// If refreshperiod has changed and is more than minimum val
	if (
		newSettings.autoRefresh &&
		newSettings.autoRefresh >= MIMIMUMREFRESHPERIOD &&
		quickStorage.settings.autoRefresh !== newSettings.autoRefresh
	) {
		autoFetch.change(newSettings.autoRefresh);
	}

	const settings = {
		...defaultSettings,
		...newSettings,
	};

	// Distribute settings to all tabs
	quickStorage.settings = settings;
	sendToAllTabs({
		settings,
	});

	// Do a new fetch when we have new settings
	fetchData();
}

// removes a repo by its index-value
export function autoRemoveRepo(repoNr) {
	const settings = quickStorage.settings;

	const repos = settings.repos.filter((value, index) => index !== repoNr);

	const newSettings = {
		...settings,
		repos,
	};

	// Distribute settings to all tabs
	quickStorage.settings = newSettings;
	sendToAllTabs({
		settings: newSettings,
	});

	// Do a new fetch when we have new settings
	fetchData();
}

// This function is a fire and forget function
// that handles all internal erros by it self.
// No callerfunction relies on the returned data from this function
export function fetchData() {
	const { settings } = quickStorage;
	if (!settings || !settings.token) {
		return;
	}

	// Show loadinganimation when we are fetching data
	sendToAllTabs({
		loading: true,
	});

	return fetchDataFromAPI(settings)
		.then(({ newRepoData, rateLimit }) => {
			// Transfer read and collapsed-status from old repositories
			const repositories = transferUserStatus(newRepoData);
			//
			// save and distribute
			quickStorage.repositories = repositories;
			quickStorage.rateLimit = rateLimit;
			sendToAllTabs({
				repositories,
				rateLimit,
				loading: false,
			});
		})
		.catch((err) => {
			if (!err) {
				return;
			}

			errors.push(...err); // TODO: Set errors in a better way?

			sendToAllTabs({
				errors,
				loading: false,
			});
		});
}
