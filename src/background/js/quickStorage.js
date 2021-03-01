import defaultSettings from './defaultSettings.json';

export const quickStorage = {
	settings: undefined,
	repositories: undefined,
	rateLimit: undefined,
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
