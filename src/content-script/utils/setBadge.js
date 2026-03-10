import { hasUnreadItems } from './utils.js';
import Favico from 'favico.js';

export const faviconOptions = {
	// Animation wont work with position upleft, so we set it to none
	animation: 'none',
	bgColor: '#FDB23C',
	textColor: '#FDB23C',
	position: 'upleft',
};

let favicon = null;

function getFavicon() {
	if (!favicon) {
		favicon = new Favico(faviconOptions);
	}
	return favicon;
}

export function __getFaviconForTests() {
	return getFavicon();
}

let OldUnReadStatus = false;

export default function setBadge(repositories, showFavicon) {
	if (!showFavicon) {
		OldUnReadStatus = false;
		getFavicon().reset();
		return;
	}

	const hasUnread = hasUnreadItems(repositories);

	if (OldUnReadStatus !== hasUnread) {
		if (hasUnread) {
			getFavicon().badge('+');
		} else {
			getFavicon().reset();
		}

		OldUnReadStatus = hasUnread;
	}
}
