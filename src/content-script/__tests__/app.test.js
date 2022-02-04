/**
 * @jest-environment jsdom
 */

import React from 'react';
import Index from '../app';

import { render as tlrRender } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createQuickStorage } from '../../../test/generate';
import setBadge from '../utils/setBadge.js';
jest.mock('../utils/setBadge.js');
// Mock timespecific functions
import '../utils/time.js';
jest.mock('../utils/time.js', () => ({
	...jest.requireActual('../utils/time.js'),
	until: () => '1 month',
	ago: () => '1 month',
}));

// mock debounce
import '../utils/utils.js';
jest.mock('../utils/utils.js', () => ({
	...jest.requireActual('../utils/utils.js'),
	debounce: (func) => {
		return function (...args) {
			func.apply(this, args);
		};
	},
}));

// mock path functions
const testRepo = { name: 'newRepo', owner: 'UserX' };
import '../components/Settings/getPath.js';
jest.mock('../components/Settings/getPath.js', () => ({
	...jest.requireActual('../components/Settings/getPath.js'),
	canAddRepository: () => true,
	getCurrentPath: jest
		.fn()
		.mockReturnValueOnce(false)
		.mockReturnValueOnce(testRepo),
}));

function render(props) {
	const utils = tlrRender(<Index {...props} />);
	return {
		...utils,
	};
}

const sendMessage = jest.fn((message, cb) => {
	if (cb) {
		cb();
	}
});

function setupDataFromBackground(state) {
	global.chrome = {
		runtime: {
			onMessage: {
				addListener: jest.fn((listener) => {
					listener(state);
				}),
			},
			sendMessage,
		},
	};
}

const OLD_ENV = process.env;

beforeEach(() => {
	sendMessage.mockClear();

	// Allow to overwrite process.env
	jest.resetModules();
	process.env.npm_package_version = OLD_ENV; // Make a copy
});

afterAll(() => {
	process.env.npm_package_version = OLD_ENV; // Restore old environment
});

describe('generic snapshots', () => {
	it('should render a splashscreen if token is missing', () => {
		const serverData = createQuickStorage();
		delete serverData.settings.token;
		setupDataFromBackground(serverData);

		const { container } = render();

		// We do one snapshot of each type to get any essential changes
		// that can be made
		expect(container).toMatchSnapshot();
	});

	it('should render repos', () => {
		const serverData = createQuickStorage();
		setupDataFromBackground(serverData);

		const { container } = render();

		// We do one snapshot of each type to get any essential changes
		// that can be made
		expect(container).toMatchSnapshot();
	});

	it('should render settingspage', () => {
		process.env.npm_package_version = '1.0.0';
		const serverData = createQuickStorage();
		setupDataFromBackground(serverData);

		const { container, getByLabelText } = render();

		userEvent.click(getByLabelText(/show settings/i));

		// We do one snapshot of each type to get any essential changes
		// that can be made
		expect(container).toMatchSnapshot();
	});
});

describe('index', () => {
	it('should do a init to fetch initial data', () => {
		setupDataFromBackground();

		const { container } = render();
		// Should not render anything if settings is missing
		expect(container).toMatchInlineSnapshot(`<div />`);
		expect(sendMessage).toHaveBeenCalledTimes(1);
		expect(sendMessage).toHaveBeenCalledWith(
			{ type: 'init' },
			expect.any(Function)
		);
	});

	it('should update badge based on repostatus', () => {
		const serverData = createQuickStorage();
		setupDataFromBackground(serverData);

		render();

		expect(setBadge).toHaveBeenCalledTimes(1);
		expect(setBadge).toHaveBeenCalledWith(
			serverData.repositories,
			serverData.settings.updateFavicon
		);
	});
});

describe('repositories', () => {
	it('should render a placholder if no repos are added', () => {
		const serverData = createQuickStorage();
		serverData.repositories = [];
		setupDataFromBackground(serverData);

		const { queryByText, getByText } = render();

		// To render empty screen
		expect(queryByText('No repositories added')).toBeInTheDocument();

		// Click link to go to settingspage
		userEvent.click(getByText(/settings page/i));

		// Expect settingspage to be shown
		expect(queryByText(/no repositories added/i)).not.toBeInTheDocument();
	});

	it('should toggle read for all elements in a repo', async () => {
		const serverData = createQuickStorage();
		setupDataFromBackground(serverData);

		const { getAllByTitle } = render();

		sendMessage.mockClear();
		const button = getAllByTitle(/mark repo as read/i)[0];
		userEvent.click(button);

		expect(sendMessage).toHaveBeenCalledTimes(1);
		expect(sendMessage).toHaveBeenCalledWith(
			{
				type: 'toggleRead',
				repo: serverData.repositories[0].url,
				status: true,
			},
			null
		);
	});

	it('should toggle the repo', async () => {
		const serverData = createQuickStorage();
		setupDataFromBackground(serverData);

		const { getAllByLabelText } = render();

		sendMessage.mockClear();
		const button = getAllByLabelText(/toggle visibility of items/i)[0];
		userEvent.click(button);

		expect(sendMessage).toHaveBeenCalledTimes(1);
		expect(sendMessage).toHaveBeenCalledWith(
			{
				type: 'toggleCollapsed',
				url: serverData.repositories[0].url,
			},
			null
		);
	});

	it('should prevent that toggle collapse is triggered when a linkk in header is clicked', async () => {
		const serverData = createQuickStorage();
		setupDataFromBackground(serverData);

		const { getAllByText } = render();

		sendMessage.mockClear();
		const button = getAllByText(serverData.repositories[0].issues[0].author)[0];
		userEvent.click(button);

		// if stopPropagation work as expected then postmessage
		// should not have been called
		expect(sendMessage).not.toHaveBeenCalledTimes(1);
	});

	it('should show total number of items of a type', async () => {
		const serverData = createQuickStorage();
		serverData.repositories[0].totalItems.issues = 100;

		setupDataFromBackground(serverData);

		const { queryAllByText } = render();

		expect(
			queryAllByText((_, node) => node.textContent === 'Issues (4 of 100)')[0]
		).toBeInTheDocument();
	});
});

describe('single item', () => {
	it('should toggle read for a single item', async () => {
		const serverData = createQuickStorage();
		setupDataFromBackground(serverData);

		const { getAllByTitle } = render();

		sendMessage.mockClear();
		const button = getAllByTitle(/mark as read/i)[0];
		userEvent.click(button);

		expect(sendMessage).toHaveBeenCalledTimes(1);
		expect(sendMessage).toHaveBeenCalledWith(
			{
				type: 'toggleRead',
				id: serverData.repositories[0].issues[0].id,
			},
			null
		);
	});

	it('should only render a comment icon if there is any comments', async () => {
		const serverData = createQuickStorage();
		serverData.repositories[0].issues[0].comments = 0;
		setupDataFromBackground(serverData);

		const { getAllByTitle } = render();

		sendMessage.mockClear();
		const repo = getAllByTitle(serverData.repositories[0].issues[0].title)[0];
		expect(repo).toMatchSnapshot();
	});

	it('should render created text based on sortby setttings', async () => {
		let serverData = createQuickStorage();
		setupDataFromBackground(serverData);

		let { queryAllByText } = render();

		const issue = serverData.repositories[0].issues[0];
		// The entire text-node is read, so the text we need to match is combined of all elements
		const createdText = `${issue.title} ${issue.comments}By ${issue.author}, created`;
		const updatedText = `${issue.title} ${issue.comments}By ${issue.author}, updated`;

		expect(
			queryAllByText((_, node) => node.textContent.startsWith(createdText))[0]
		).toBeInTheDocument();

		expect(
			queryAllByText((_, node) => node.textContent.startsWith(updatedText))[0]
		).toBeFalsy();
	});

	it('should render updated text based on sortby settings', async () => {
		let serverData = createQuickStorage();
		serverData.settings.sortBy = 'UPDATED_AT';
		setupDataFromBackground(serverData);

		let { queryAllByText } = render();

		const issue = serverData.repositories[0].issues[0];
		// The entire text-node is read, so the text we need to match is combined of all elements
		const createdText = `${issue.title} ${issue.comments}By ${issue.author}, created`;
		const updatedText = `${issue.title} ${issue.comments}By ${issue.author}, updated`;

		expect(
			queryAllByText((_, node) => node.textContent.startsWith(createdText))[0]
		).toBeFalsy();

		expect(
			queryAllByText((_, node) => node.textContent.startsWith(updatedText))[0]
		).toBeInTheDocument();
	});
});

describe('settings', () => {
	it('should set setting for listItemOfType', () => {
		const serverData = createQuickStorage();
		setupDataFromBackground(serverData);

		const { getByLabelText, getByText } = render();
		userEvent.click(getByLabelText(/show settings/i));

		sendMessage.mockClear();
		const select = getByLabelText(/show items from/i);

		userEvent.selectOptions(select, ['issues']);

		expect(getByText('Issues').selected).toBeTruthy();
		expect(sendMessage).toHaveBeenCalledTimes(1);
		expect(sendMessage.mock.calls[0][0].type).toBe('saveSettings');
		expect(sendMessage.mock.calls[0][0].settings.listItemOfType).toBe('issues');
	});

	it('should set setting for sortBy', () => {
		const serverData = createQuickStorage();
		setupDataFromBackground(serverData);

		const { getByLabelText, getByText } = render();
		userEvent.click(getByLabelText(/show settings/i));

		sendMessage.mockClear();

		const select = getByLabelText(/sort items by/i);
		userEvent.selectOptions(select, ['UPDATED_AT']);

		expect(getByText('Updated').selected).toBeTruthy();
		expect(getByText('Created').selected).toBeFalsy();
		expect(sendMessage.mock.calls[0][0].settings.sortBy).toBe('UPDATED_AT');
	});

	it('should set setting for numberOfItems', () => {
		const serverData = createQuickStorage();
		setupDataFromBackground(serverData);

		const { getByLabelText } = render();
		userEvent.click(getByLabelText(/show settings/i));

		sendMessage.mockClear();

		const input = getByLabelText(/number of items to load/i);
		userEvent.type(input, '{backspace}8');

		expect(input).toHaveValue(8);
		expect(sendMessage.mock.calls[1][0].settings.numberOfItems).toBe(8);
	});

	it('should validate numberOfItems', () => {
		const serverData = createQuickStorage();
		setupDataFromBackground(serverData);

		const { getByLabelText } = render();
		userEvent.click(getByLabelText(/show settings/i));

		const input = getByLabelText(/number of items to load/i);

		// min
		userEvent.type(input, '{backspace}-1');
		userEvent.click(document.body); // move the focus away to trigger validation
		expect(input).toHaveValue(0);

		// Max
		userEvent.type(input, '{backspace}100');
		userEvent.click(document.body); // move the focus away to trigger validation
		expect(input).toHaveValue(10);
	});

	it('should set setting for autoRefresh', async () => {
		const serverData = createQuickStorage();
		setupDataFromBackground(serverData);

		const { getByLabelText } = render();
		userEvent.click(getByLabelText(/show settings/i));

		sendMessage.mockClear();

		const input = getByLabelText(/get repo data every/i);
		userEvent.type(input, '{backspace}3{arrowright}{backspace}');

		expect(input).toHaveValue(3);
		expect(sendMessage.mock.calls[2][0].settings.autoRefresh).toBe(180000);
	});

	it('should set setting for theme', () => {
		const serverData = createQuickStorage();
		setupDataFromBackground(serverData);

		const { getByLabelText, getByText } = render();
		userEvent.click(getByLabelText(/show settings/i));

		sendMessage.mockClear();

		const select = getByLabelText(/theme/i);
		userEvent.selectOptions(select, ['light']);

		expect(getByText('Light').selected).toBeTruthy();
		expect(getByText('Dark').selected).toBeFalsy();
		expect(sendMessage.mock.calls[0][0].settings.theme).toBe('light');
	});

	it('should set setting for updateFavicon', () => {
		const serverData = createQuickStorage();
		setupDataFromBackground(serverData);

		const { getByLabelText } = render();
		userEvent.click(getByLabelText(/show settings/i));

		sendMessage.mockClear();

		const checkbox = getByLabelText(/highlight favicon if/i);
		expect(checkbox.checked).toBeTruthy();
		userEvent.click(checkbox);

		expect(checkbox.checked).toBeFalsy();
		expect(sendMessage.mock.calls[0][0].settings.updateFavicon).toBe(false);
	});

	it('should set setting for token', () => {
		const serverData = createQuickStorage();
		setupDataFromBackground(serverData);

		const { getByLabelText } = render();
		userEvent.click(getByLabelText(/show settings/i));

		sendMessage.mockClear();

		const input = getByLabelText(/access token/i);
		userEvent.type(input, 'Works');

		const newValue = `${serverData.settings.token}Works`;
		expect(input).toHaveValue(newValue);
		expect(sendMessage.mock.calls[4][0].settings.token).toBe(newValue);
	});
});

describe('settings repohandling', () => {
	it('should not add repo if repo data is not provided', () => {
		const serverData = createQuickStorage();
		setupDataFromBackground(serverData);

		const { getByLabelText, getByText } = render();
		userEvent.click(getByLabelText(/show settings/i));

		sendMessage.mockClear();

		const select = getByText(/add current repository/i);
		userEvent.click(select);

		expect(sendMessage).not.toHaveBeenCalled();
	});

	it('should add repo when repodata is provided', () => {
		const serverData = createQuickStorage();
		setupDataFromBackground(serverData);

		const { getByLabelText, getByText } = render();
		userEvent.click(getByLabelText(/show settings/i));

		sendMessage.mockClear();

		const select = getByText(/add current repository/i);
		userEvent.click(select);

		expect(sendMessage.mock.calls[0][0].settings.repos[4]).toBe(testRepo);
	});

	it('should handle delete repos', () => {
		const serverData = createQuickStorage();
		setupDataFromBackground(serverData);

		const { getByLabelText, getAllByLabelText } = render();
		userEvent.click(getByLabelText(/show settings/i));

		sendMessage.mockClear();

		const select = getAllByLabelText(/remove repo/i)[2];
		userEvent.click(select);

		expect(sendMessage).toHaveBeenCalledTimes(1);
		expect(sendMessage.mock.calls[0][0].settings.repos.length).toBe(3);
		expect(sendMessage.mock.calls[0][0].settings.repos[0].name).toBe(
			serverData.settings.repos[0].name
		);
		expect(sendMessage.mock.calls[0][0].settings.repos[1].name).toBe(
			serverData.settings.repos[1].name
		);
		expect(sendMessage.mock.calls[0][0].settings.repos[2].name).toBe(
			serverData.settings.repos[3].name
		);
	});
});
