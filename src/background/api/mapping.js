import { quickStorage } from '../settings/';

export async function mapDataToInternalFormat(data) {
	const { viewer, ...repos } = data;

	const repositories = await quickStorage.getRepositories();

	// TODO: Can we do the transfer of data inside this function instead of doing seperate loop?
	// Loop through each returned repo
	return Object.values(repos).map((repo) => {
		const oldRepo = repositories.find((oldRepo) => oldRepo.url === repo.url);

		const oldTotalItemsNumber = oldRepo?.totalItemsNumber;
		const newTotalItemsNumber = calculateMaxNumber(repo);

		// Mapping data from items
		const issues = listItems(repo.issues, viewer, oldTotalItemsNumber);
		const pullRequests = listItems(
			repo.pullRequests,
			viewer,
			oldTotalItemsNumber
		);

		return {
			name: repo.name,
			owner: repo.owner.login,
			url: repo.url,
			collapsed: true,
			totalItemsNumber: newTotalItemsNumber,
			totalItems: {
				issues: repo.issues.totalCount,
				pullRequests: repo.pullRequests.totalCount,
			},
			issues,
			pullRequests,
		};
	});
}

function listItems(element, { login }, totalItemNumber) {
	return element.edges.map(({ node: item }) => {
		return {
			id: item.id,
			title: item.title,
			url: item.url,
			reviewStatus:
				item.reviews && item.reviews.nodes.length > 0
					? item.reviews.nodes[0].state
					: null,
			updatedAt: item.updatedAt,
			createdAt: item.createdAt,
			comments: item.comments.totalCount,
			read: setItemReadStatus(item, login, totalItemNumber),
			author: item.author.login,
		};
	});
}

function setItemReadStatus(item, login, totalItemNumber) {
	// If extensionholder and itemauthor is the same, we  set it to read
	if (item.author.login === login) {
		return true;
	}

	// It totalItemNumber is undefined, then we have probably
	// just added a new repo, we therefore set all items as read
	if (typeof totalItemNumber === 'undefined') {
		return true;
	}

	// If the number of this item is below the
	// max number this repo contains, then we will set it as
	// unread
	if (item.number <= totalItemNumber) {
		return true;
	}

	return false;
}

// Find how many total items have been created in the repo
function calculateMaxNumber(repo) {
	const maxIssues = repo.issuesMaxNumber?.edges[0]?.node?.number || 0;
	const maxPullRequests =
		repo.pullRequestsMaxNumber?.edges[0]?.node?.number || 0;

	return Math.max(maxIssues, maxPullRequests);
}
