import { hasUnreadItems } from './utils.js';
import Favico from 'favico.js';
const favicon = new Favico({
	// Animation wont work with position upleft, so we set it to none
	animation: 'none',
	bgColor: '#FDB23C',
	textColor: '#FDB23C',
	position: 'upleft',
});

let OldUnReadStatus = false;

export default function setBadge(repositories, showFavicon) {
	if (!showFavicon) {
		OldUnReadStatus = false;
		favicon.reset();
		return;
	}

	const hasUnread = hasUnreadItems(repositories);

	if (OldUnReadStatus !== hasUnread) {
		if (hasUnread) {
			favicon.badge('+');
		} else {
			favicon.reset();
		}

		OldUnReadStatus = hasUnread;
	}
}
