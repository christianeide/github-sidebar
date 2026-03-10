import { useCallback, useEffect, useState } from 'react';
import {
	getSidebarVisibilityFromLocalStorage,
	SIDEBAR_VISIBILITY_STORAGE_KEY,
	syncSidebarVisibilityAttribute,
} from '../utils/sidebarVisibility.js';

export default function useSidebarVisibility() {
	const [sidebarVisible, setSidebarVisible] = useState(
		getSidebarVisibilityFromLocalStorage,
	);

	useEffect(() => {
		syncSidebarVisibilityAttribute(sidebarVisible);
	}, [sidebarVisible]);

	useEffect(() => {
		const handleStorage = (event) => {
			if (event.key !== SIDEBAR_VISIBILITY_STORAGE_KEY) {
				return;
			}

			if (event.newValue === null) {
				setSidebarVisible(true);
				return;
			}

			setSidebarVisible(event.newValue === 'true');
		};

		window.addEventListener('storage', handleStorage);

		return () => {
			window.removeEventListener('storage', handleStorage);
		};
	}, []);

	const toggleSidebarVisibility = useCallback(() => {
		setSidebarVisible((previousValue) => {
			const nextValue = !previousValue;
			localStorage.setItem(SIDEBAR_VISIBILITY_STORAGE_KEY, String(nextValue));
			return nextValue;
		});
	}, []);

	return { sidebarVisible, toggleSidebarVisibility };
}
