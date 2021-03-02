import { createPullRequestsQuery } from './graphql.js';
import { autoRemoveRepo } from '../background.js';

export function fetchDataFromAPI({ token, repos, numberOfItems, sortBy }) {
	return new Promise((resolve, reject) => {
		if (!numberOfItems) {
			return reject();
		}

		const query = createPullRequestsQuery(repos, numberOfItems, sortBy);

		fetch('https://api.github.com/graphql', {
			method: 'post',
			headers: {
				Authorization: `Bearer ${token}`,
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ query }),
		})
			.then((res) => res.json())
			.then((result) => {
				if (result.errors) {
					const userError = result.errors.map((item) => {
						if (item.type === 'NOT_FOUND') {
							// Repos are named 'repo{number}' in graphql-kalls
							const missingRepoNumber = Number(
								item.path[0].replace('repo', '')
							);

							autoRemoveRepo(missingRepoNumber);

							return {
								title: 'Error in API query to Github ',
								message: `${item.message} Will now autoremove repo from list.`,
								time: Date.now(),
							};
						}

						return {
							title: 'Error in API query to Github ',
							message: item.message,
							time: Date.now(),
						};
					});

					return reject(userError);
				} else if (!result.data) {
					return reject([
						{
							title: 'Could not reach Githubs API at this moment ',
							message: result.message || 'Unknown error',
							time: Date.now(),
						},
					]);
				}

				const { rateLimit, viewer, ...repos } = result.data;
				const newRepoData = [];
				Object.keys(repos).forEach((key) => {
					const repo = repos[key];

					// Mapping data from items
					const issues = listItems(repo, 'issues', viewer);
					const pullRequests = listItems(repo, 'pullRequests', viewer);

					newRepoData.push({
						name: repo.name,
						owner: repo.owner.login,
						url: repo.url,
						collapsed: true,
						totalItems: {
							issues: repo.issues.totalCount,
							pullRequests: repo.pullRequests.totalCount,
						},
						issues,
						pullRequests,
					});
				});

				return resolve({ newRepoData, rateLimit });
			})
			.catch((error) => {
				// If we dont have a error resonse, its probably a network error.
				// We dont want to flood users with network errors
				if (!error.response) {
					return reject();
				}

				const userError = [
					{
						title: error.message,
						message: error.response.data.message,
						time: Date.now(),
					},
				];

				return reject(userError);
			});
	});
}
function listItems(repo, type, { login }) {
	return repo[type].edges.map(({ node: item }) => {
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
			// If extensionholder and itemauthor is the same, we  set it to read
			read: item.author.login === login,
			author: item.author.login,
		};
	});
}
