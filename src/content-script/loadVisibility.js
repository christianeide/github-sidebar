import {
	getSidebarVisibilityFromLocalStorage,
	syncSidebarVisibilityAttribute,
} from './utils/sidebarVisibility.js';

const initialSidebarVisibility = getSidebarVisibilityFromLocalStorage();
syncSidebarVisibilityAttribute(initialSidebarVisibility);
