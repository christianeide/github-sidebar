export function listItems(element, { login }, totalItemNumber) {
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
	// if (item.author.login === login) {
	// 	return true;
	// }

	if (item.number <= totalItemNumber) {
		return true;
	}

	return false;
}

// Find how many total items have been created in the repo
export function calculateMaxNumber(repo) {
	return Math.max(
		repo.issuesMaxNumber?.edges[0]?.node?.number,
		repo.pullRequestsMaxNumber?.edges[0]?.node?.number
	);
}
