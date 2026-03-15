import { defaultSettings } from './index';

export const quickStorage = {
	_settings: undefined,
	_repositories: undefined,
	_rateLimit: undefined,
	setValue(name, value) {
		chrome.storage.local.set({
			[name]: value,
		});

		this[`_${name}`] = value;
	},
	getValue(name) {
		return new Promise((resolve) => {
			const nameProp = `_${name}`;
			if (this[nameProp]) {
				return resolve(this[nameProp]);
			}

			this.getStorage().then(() => resolve(this[nameProp]));
		});
	},
	getRateLimit() {
		return this.getValue('rateLimit');
	},
	setRateLimit(rateLimit) {
		this.setValue('rateLimit', rateLimit);
	},
	getRepositories() {
		return this.getValue('repositories');
	},
	setRepositories(repositories) {
		this.setValue('repositories', repositories);
	},
	getSettings() {
		return this.getValue('settings');
	},
	setSettings(settings) {
		this.setValue('settings', settings);
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
				},
			);
		});
	},
};
