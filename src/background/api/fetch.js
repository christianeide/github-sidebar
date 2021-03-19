import {
	mapDataToInternalFormat,
	createPullRequestsQuery,
	transferUserStatus,
	autoRemoveRepo,
} from './index.js';
import { ports } from '../lib/';
import { quickStorage } from '../settings/';
export let apiErrors = {
	_errors: [],
	get() {
		return this._errors;
	},
	set(newErrors) {
		this._errors = newErrors;
	},
	push(newErrors) {
		this._errors.push(...newErrors);
	},
};

// This function is a fire and forget function
// that handles all internal erros by it self.
// No callerfunction relies on the returned data from this function
export function fetchData() {
	const { settings } = quickStorage;
	if (!settings || !settings.token) {
		return;
	}

	// Show loadinganimation when we are fetching data
	ports.sendToAllTabs({
		loading: true,
	});

	return fetchDataFromAPI(settings)
		.then(({ rateLimit, ...restData }) => {
			const newRepoData = mapDataToInternalFormat(restData);

			// Transfer read and collapsed-status from old repositories
			const repositories = transferUserStatus(newRepoData);

			// save and distribute
			quickStorage.repositories = repositories;
			quickStorage.rateLimit = rateLimit;
			ports.sendToAllTabs({
				repositories,
				rateLimit,
				loading: false,
			});
		})
		.catch((err) => {
			if (!err) {
				return;
			}

			apiErrors.push(err);

			ports.sendToAllTabs({
				errors: apiErrors.get(),
				loading: false,
			});
		});
}

function fetchDataFromAPI({ token, repos, numberOfItems, sortBy }) {
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
								title: 'Error in API query to Github',
								message: `${item.message}: Will now autoremove repo from list.`,
								time: Date.now(),
							};
						}

						return {
							title: 'Error in API query to Github',
							message: item.message,
							time: Date.now(),
						};
					});

					return reject(userError);
				} else if (!result.data) {
					return reject([
						{
							title: 'Could not reach Githubs API at this moment',
							message: result.message || 'Unknown error',
							time: Date.now(),
						},
					]);
				}

				return resolve(result.data);
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
