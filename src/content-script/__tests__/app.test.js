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

function render(props) {
	const utils = tlrRender(<Index {...props} />);
	return {
		...utils,
	};
}

const postMessage = jest.fn();
const removeListener = jest.fn();

function setupDataFromBackground(state) {
	global.chrome = {
		runtime: {
			connect: jest.fn(function () {
				return {
					postMessage,
					onDisconnect: {
						addListener: jest.fn(),
					},
					onMessage: {
						addListener: jest.fn((listener) => {
							listener(state);
						}),
						removeListener,
					},
				};
			}),
		},
	};
}

const OLD_ENV = process.env;

beforeEach(() => {
	postMessage.mockClear();
	removeListener.mockClear();

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

		const { container, unmount } = render();
		// Should not render anything if settings is missing
		expect(container).toMatchInlineSnapshot(`<div />`);
		expect(postMessage).toHaveBeenCalledTimes(1);
		expect(postMessage).toHaveBeenCalledWith({ type: 'init' });

		unmount();
		expect(removeListener).toHaveBeenCalled();
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

		postMessage.mockClear();
		const button = getAllByTitle(/mark repo as read/i)[0];
		userEvent.click(button);

		expect(postMessage).toHaveBeenCalledTimes(1);
		expect(postMessage).toHaveBeenCalledWith({
			type: 'toggleRead',
			repo: serverData.repositories[0].url,
			status: true,
		});
	});

	it('should toggle the repo', async () => {
		const serverData = createQuickStorage();
		setupDataFromBackground(serverData);

		const { getAllByLabelText } = render();

		postMessage.mockClear();
		const button = getAllByLabelText(/toggle visibility of items/i)[0];
		userEvent.click(button);

		expect(postMessage).toHaveBeenCalledTimes(1);
		expect(postMessage).toHaveBeenCalledWith({
			type: 'toggleCollapsed',
			url: serverData.repositories[0].url,
		});
	});

	it('should prevent that toggle collapse is triggered when a linkk in header is clicked', async () => {
		const serverData = createQuickStorage();
		setupDataFromBackground(serverData);

		const { getAllByText } = render();

		postMessage.mockClear();
		const button = getAllByText(serverData.repositories[0].issues[0].author)[0];
		userEvent.click(button);

		// if stopPropagation work as expected then postmessage
		// should not have been called
		expect(postMessage).not.toHaveBeenCalledTimes(1);
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

		postMessage.mockClear();
		const button = getAllByTitle(/mark as read/i)[0];
		userEvent.click(button);

		expect(postMessage).toHaveBeenCalledTimes(1);
		expect(postMessage).toHaveBeenCalledWith({
			type: 'toggleRead',
			id: serverData.repositories[0].issues[0].id,
		});
	});

	it('should only render a comment icon if there is any comments', async () => {
		const serverData = createQuickStorage();
		serverData.repositories[0].issues[0].comments = 0;
		setupDataFromBackground(serverData);

		const { getAllByTitle } = render();

		postMessage.mockClear();
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

	it('should render updated text based on sortby setttings', async () => {
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
	it('should set setting for listItemOfType', async () => {
		const serverData = createQuickStorage();
		setupDataFromBackground(serverData);

		const { getByLabelText, getByText } = render();
		userEvent.click(getByLabelText(/show settings/i));

		const select = getByLabelText(/show items from/i);

		userEvent.selectOptions(select, ['issues']);

		expect(getByText('Issues')).toMatchInlineSnapshot(`
		<option
		  value="issues"
		>
		  Issues
		</option>
	`);
	});
});
