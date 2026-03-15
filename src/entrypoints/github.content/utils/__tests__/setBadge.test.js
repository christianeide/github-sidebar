import { vi } from 'vitest';
import setBadge, { faviconOptions, __getFaviconForTests } from '../setBadge';
import { hasUnreadItems } from '../utils';

vi.mock('../utils');

let showFavicon;
const repositories = [];
let favicon;

describe('favico initial setup', () => {
	it('should initialize favico with default settings', () => {
		expect(faviconOptions).toMatchInlineSnapshot(`
		{
		  "animation": "none",
		  "bgColor": "#FDB23C",
		  "position": "upleft",
		  "textColor": "#FDB23C",
		}
	`);
	});
});

describe('setBadge', () => {
	beforeEach(() => {
		showFavicon = true;
		favicon = __getFaviconForTests();
		favicon.reset = vi.fn();
		favicon.badge = vi.fn();
		hasUnreadItems.mockReset();
	});

	it('should not show favicon if settings parameter is false', () => {
		showFavicon = false;

		setBadge(repositories, showFavicon);
		expect(favicon.reset).toBeCalledTimes(1);
		expect(hasUnreadItems).not.toBeCalled();
	});

	it('should show favicon if we have unread items', () => {
		hasUnreadItems.mockImplementation(() => true);

		setBadge(repositories, showFavicon);
		expect(hasUnreadItems).toBeCalled();
		expect(favicon.badge).toBeCalledTimes(1);
		expect(favicon.badge).toBeCalledWith('+');
		expect(favicon.reset).not.toBeCalled();

		favicon.badge.mockClear();

		// If we call it again with the same data,
		// then we dont expect the badge to be set again
		setBadge(repositories, showFavicon);
		expect(hasUnreadItems).toBeCalled();
		expect(favicon.badge).not.toBeCalled();
	});

	it('should not show favicon if we dont have unread items', () => {
		hasUnreadItems.mockImplementation(() => false);

		setBadge(repositories, showFavicon);
		expect(hasUnreadItems).toBeCalled();
		expect(favicon.reset).toBeCalledTimes(1);
		expect(favicon.badge).not.toBeCalled();
	});

	it('should show the badge if we have toggled the setting switch', () => {
		// First we setup so that the read status is calculated and shown
		hasUnreadItems.mockImplementation(() => true);
		setBadge(repositories, showFavicon);

		favicon.badge.mockClear();

		// Then we toggle off the badge,
		// this should set the oldunreadstatus to false
		showFavicon = false;
		setBadge(repositories, showFavicon);

		favicon.reset.mockClear();

		// Then we toggle on the badge again
		// and we show the badge if true
		showFavicon = true;
		setBadge(repositories, showFavicon);
		expect(favicon.badge).toBeCalled();
	});
});
