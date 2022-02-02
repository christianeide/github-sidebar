import { defaultSettings } from './index';

// TODO: Use HOF
export const quickStorage = {
	_settings: undefined,
	_repositories: undefined,
	_rateLimit: undefined,
	getRateLimit() {
		return new Promise((resolve) => {
			if (this._rateLimit) {
				return resolve(this._rateLimit);
			}

			this.getStorage().then(() => resolve(this._rateLimit));
		});
	},
	setRateLimit(rateLimit) {
		chrome.storage.local.set({
			rateLimit,
		});

		this._rateLimit = rateLimit;
	},
	getRepositories() {
		return new Promise((resolve) => {
			if (this._repositories) {
				return resolve(this._repositories);
			}

			this.getStorage().then(() => resolve(this._repositories));
		});
	},
	setRepositories(repositories) {
		chrome.storage.local.set({
			repositories,
		});

		this._repositories = repositories;
	},
	getSettings() {
		return new Promise((resolve) => {
			if (this._settings) {
				return resolve(this._settings);
			}

			this.getStorage().then(() => resolve(this._settings));
		});
	},
	setSettings(settings) {
		chrome.storage.local.set({
			settings,
		});

		this._settings = settings;
	},
	getStorage() {
		return new Promise((resolve) => {
			// If we already have some data to return
			if (this._settings) {
				return resolve({
					settings: this._settings,
					repositories: this._repositories,
					rateLimit: this._rateLimit,
				});
			}

			// If not we fetches data from storage
			chrome.storage.local.get(
				['settings', 'repositories', 'rateLimit'],
				({ settings, repositories, rateLimit }) => {
					// merges default settings and user settings
					this.setSettings({ ...defaultSettings, ...settings });
					this.setRepositories(repositories);
					this.setRateLimit(rateLimit);

					resolve({
						settings: this._settings,
						repositories: this._repositories,
						rateLimit: this._rateLimit,
					});
				}
			);
		});
	},
};
