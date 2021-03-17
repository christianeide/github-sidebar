import { createPullRequestsQuery } from './graphql.js';
import { sendToAllTabs } from '../lib/ports.js';
import { quickStorage } from '../settings/quickStorage';
import { transferUserStatus } from './transfer.js';
import { listItems } from './mapping.js';
// import { listItems, calculateMaxNumber } from './mapping.js';
import { autoRemoveRepo } from './remove';
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
	sendToAllTabs({
		loading: true,
	});

	return fetchDataFromAPI(settings)
		.then((data) => {
			const { rateLimit, viewer, ...repos } = data;
			const newRepoData = [];
			Object.keys(repos).forEach((key) => {
				const repo = repos[key];

				// TODO: Hvordan kan vi refaktorere litt her?
				// TODO: Skriv testere for det som er gjort først? og så refactor
				const oldRepo = quickStorage.repositories.find(
					(oldRepo) => oldRepo.url === repo.url
				);

				// TODO: Flytt mapping over i egen fil

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

				newRepoData.push({
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
				});
			});

			// Transfer read and collapsed-status from old repositories
			const repositories = transferUserStatus(newRepoData);

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

			apiErrors.push(err); // TODO: Set errors in a better way?

			sendToAllTabs({
				errors: apiErrors.get(),
				loading: false,
			});
		});
}

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
