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

export function debounce(func, delay) {
	let inDebounce;
	return function (...args) {
		const context = this;
		clearTimeout(inDebounce);
		inDebounce = setTimeout(() => func.apply(context, args), delay);
	};
}
