import { quickStorage } from '../settings/quickStorage';

export function mapDataToInternalFormat(data) {
	const { viewer, ...repos } = data;

	// Loop through each reeturned repo
	return Object.values(repos).map((repo) => {
		const oldRepo = quickStorage.repositories.find(
			(oldRepo) => oldRepo.url === repo.url
		);

		// TODO: Can we do the transfer of data inside this function?
		// instead of doing seperate loop

		// TODO: Hvis ikke vi har et gammelt repo eller et gammelt
		// tall så har vi nok lagt til et nytt repo
		// Bør vi sete ting til lest? Blir vel feil å starte opp
		// med å sette alt til ulest?
		const oldTotalItemsNumber = oldRepo?.totalItemsNumber;
		// const newTotalItemsNumber = calculateMaxNumber(repo);
		// console.log(quickStorage.repositories);
		// console.log(
		// 	'🚀 => Object.keys => newTotalItemsNumber',
		// 	newTotalItemsNumber
		// );
		// console.log(
		// 	'🚀 => Object.keys => oldTotalItemsNumber',
		// 	oldTotalItemsNumber
		// );

		// TODO: NaN issue med nora setup av en eller annen grunn?
		// KAn være fordi det ikke eksister noen issues der fra før
		// Men vi får jo for pulls, så er litt rart

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
			// totalItemsNumber: newTotalItemsNumber,
			totalItems: {
				issues: repo.issues.totalCount,
				pullRequests: repo.pullRequests.totalCount,
			},
			issues,
			pullRequests,
		};
	});
}

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
