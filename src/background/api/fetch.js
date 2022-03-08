import {
	mapDataToInternalFormat,
	createPullRequestsQuery,
	transferUserStatus,
	autoRemoveRepo,
} from './index.js';
import { sendToAllTabs } from '../lib/communication';
import { quickStorage } from '../settings/';
import { mapUnauthorizedDataToInternalFormat } from './mapping.js';
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
// TODO: Rename function to other than fetchDdata?? getRepoData?
export async function fetchData() {
	try {
		const settings = await quickStorage.getSettings();
		if (!settings) {
			return;
		}

		let newRepoData;
		let rateLimit;
		if (settings.token) {
			// Show loadinganimation when we are fetching data
			sendToAllTabs({
				loading: true,
			});

			let { rateLimit: tmpRateLimit, ...restData } = await fetchDataFromAPI(
				settings
			);
			// Assign to variable in outer scope
			rateLimit = tmpRateLimit;
			newRepoData = await mapDataToInternalFormat(restData);

			// If we dont have a token, then we will not get data from github api
			// Instead we will load a basic setup of the repos the user has added
		} else {
			newRepoData = mapUnauthorizedDataToInternalFormat(settings.repos);
		}

		// Transfer read and collapsed-status from old repositories
		const repositories = await transferUserStatus(newRepoData);

		// Save and distribute
		quickStorage.setRepositories(repositories);
		quickStorage.setRateLimit(rateLimit);
		sendToAllTabs({
			repositories,
			rateLimit,
			loading: false,
		});
	} catch (err) {
		if (!err) {
			return;
		}

		apiErrors.push(err);

		sendToAllTabs({
			errors: apiErrors.get(),
			loading: false,
		});
	}
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
