import { autoRemoveRepo } from '../remove.js';
import { quickStorage } from '../../settings/';
import { sendToAllTabs } from '../../lib/communication';
jest.mock('../../lib/communication');
import { fetchData } from '../index';
jest.mock('../index');

import { setupBackgroundTests } from '../../../../test/setup.js';

beforeEach(async () => {
	setupBackgroundTests();
});

describe('autoRemoveRepo', () => {
	it('should remove repo from settings', async () => {
		expect(quickStorage._settings.repos.length).toBe(4);
		expect(quickStorage._settings.repos[1].name).toBe('myotherrepo');

		await autoRemoveRepo(1);
		expect(quickStorage._settings.repos.length).toBe(3);
		expect(quickStorage._settings.repos[1].name).toBe('mythirdrepo');
		// Make a simple asumption that we actually have all other settings
		expect(quickStorage._settings.token).toBe('myToken');

		expect(sendToAllTabs).toHaveBeenCalledTimes(1);

		// Check that fetchData has been called
		expect(fetchData).toHaveBeenCalledTimes(1);
	});
});
