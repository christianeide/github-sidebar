import React from 'react';
import Index from '../app';

import { render as tlrRender, fireEvent, screen } from '@testing-library/react';
import { createQuickStorage } from '../../../test/generate';
import setBadge from '../utils/setBadge.js';
jest.mock('../utils/setBadge.js');

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

beforeEach(() => {
	postMessage.mockClear();
	removeListener.mockClear();
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

	it('should rendder repos', () => {
		const serverData = createQuickStorage();
		setupDataFromBackground(serverData);

		const { container } = render();

		// We do one snapshot of each type to get any essential changes
		// that can be made
		expect(container).toMatchSnapshot();
	});

	it('should rendder settingspage', () => {
		const serverData = createQuickStorage();
		setupDataFromBackground(serverData);

		const { container } = render();

		fireEvent.click(screen.getByLabelText(/show settings/i));

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
