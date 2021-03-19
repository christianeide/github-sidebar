import { autoRemoveRepo } from '../remove.js';
import { quickStorage } from '../../settings/';
import { ports } from '../../lib/';
jest.mock('../../lib/');
import { fetchData } from '../index';
jest.mock('../index');

import { setupBackgroundTests } from '../../../../test/setup.js';

beforeEach(async () => {
	setupBackgroundTests();
});

describe('autoRemoveRepo', () => {
	it('should remove repo from settings', async () => {
		expect(quickStorage.settings.repos.length).toBe(4);
		expect(quickStorage.settings.repos[1].name).toBe('myotherrepo');

		autoRemoveRepo(1);
		expect(quickStorage.settings.repos.length).toBe(3);
		expect(quickStorage.settings.repos[1].name).toBe('mythirdrepo');
		// Make a simple asumption that we actually have all other settings
		expect(quickStorage.settings.token).toBe('myToken');

		expect(ports.sendToAllTabs).toHaveBeenCalledTimes(1);

		// Check that fetchData has been called
		expect(fetchData).toHaveBeenCalledTimes(1);
	});
});
