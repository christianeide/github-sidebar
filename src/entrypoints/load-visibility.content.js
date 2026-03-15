import { defineContentScript } from '#imports';
import {
	getSidebarVisibilityFromLocalStorage,
	syncSidebarVisibilityAttribute,
} from '../utils/sidebarVisibility.js';

export default defineContentScript({
	matches: ['https://github.com/*'],
	runAt: 'document_start',
	main() {
		const initialSidebarVisibility = getSidebarVisibilityFromLocalStorage();
		syncSidebarVisibilityAttribute(initialSidebarVisibility);
	},
});
