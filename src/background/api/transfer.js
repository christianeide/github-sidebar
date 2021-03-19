import { quickStorage } from '../settings/';

export let errors = [];

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
