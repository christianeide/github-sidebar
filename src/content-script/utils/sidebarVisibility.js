export const SIDEBAR_VISIBILITY_STORAGE_KEY = 'github-sidebar:sidebar-visible';

export function getSidebarVisibilityFromLocalStorage() {
	try {
		const value = localStorage.getItem(SIDEBAR_VISIBILITY_STORAGE_KEY);
		if (value === null) {
			return true;
		}
		return value === 'true';
	} catch {
		return true;
	}
}

export function syncSidebarVisibilityAttribute(sidebarVisible) {
	document.documentElement.dataset.githubSidebarVisible =
		String(sidebarVisible);
}
