export function hasUnreadItems(repositories) {
	return repositories.some((repo) => repoHasUnreadItems(repo));
}

export function repoHasUnreadItems(repo) {
	return (
		repo.issues?.some((item) => !item.read) ||
		repo.pullRequests?.some((item) => !item.read) ||
		false
	);
}
