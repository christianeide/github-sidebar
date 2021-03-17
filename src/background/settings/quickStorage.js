import defaultSettings from './defaultSettings.json';

export const quickStorage = {
	_settings: undefined,
	_repositories: undefined,
	_rateLimit: undefined,
	get rateLimit() {
		return this._rateLimit;
	},
	set rateLimit(rateLimit) {
		chrome.storage.local.set({
			rateLimit,
		});

		this._rateLimit = rateLimit;
	},
	get repositories() {
		return this._repositories;
	},
	set repositories(repositories) {
		chrome.storage.local.set({
			repositories,
		});

		this._repositories = repositories;
	},
	get settings() {
		return this._settings;
	},
	set settings(settings) {
		chrome.storage.local.set({
			settings,
		});

		this._settings = settings;
	},
	getStorage() {
		return new Promise((resolve) => {
			// If we already have some data to return
			if (this.settings) {
				return resolve({
					settings: this.settings,
					repositories: this.repositories,
					rateLimit: this.rateLimit,
				});
			}

			// IF not we fetches data from storage
			chrome.storage.local.get(
				['settings', 'repositories', 'rateLimit'],
				({ settings, repositories, rateLimit }) => {
					// merges default settings and user settings
					this.settings = { ...defaultSettings, ...settings };
					this.repositories = repositories;
					this.rateLimit = rateLimit;

					resolve({
						settings: this.settings,
						repositories: this.repositories,
						rateLimit: this.rateLimit,
					});
				}
			);
		});
	},
};
