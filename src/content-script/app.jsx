import React, { useEffect, useState } from 'react';
import Header from './components/Header/index.jsx';
import Repositories from './components/Repositories/index.jsx';
import Settings from './components/Settings/index.jsx';
import setBadge from './utils/setBadge';

export default function App() {
	const [backgroundData, setBackgroundData] = useState({
		repositories: [],
		errors: [],
		rateLimit: undefined,
		settings: undefined,
		loading: false,
	});

	const [showSettings, setShowSettings] = useState(false);

	const sendToBackend = (message, cb = null) => {
		chrome.runtime.sendMessage(message, cb);
	};

	useEffect(() => {
		// Get preloaded data
		sendToBackend({ type: 'init' }, (initialState) => {
			setBackgroundData((state) => ({ ...state, ...initialState }));
		});

		// Set up listener for new messages
		chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
			setBackgroundData((state) => ({ ...state, ...request }));

			// ! Because of a bug in chrome 99+, we need to always
			// call sendresponse for all events https://bugs.chromium.org/p/chromium/issues/detail?id=1304272
			if (sendResponse) {
				sendResponse();
			}
		});
	}, []);

	useEffect(() => {
		setBadge(
			backgroundData.repositories,
			backgroundData.settings?.updateFavicon
		);
	}, [backgroundData.repositories, backgroundData.settings?.updateFavicon]);

	const handleToggleSettings = (e) => {
		if (e) {
			e.preventDefault();
		}
		setShowSettings(!showSettings);
	};

	const { settings, loading, errors, rateLimit, repositories } = backgroundData;

	if (!settings) {
		return null;
	}

	return (
		<div className="sidebar">
			<Header
				onToggleSettings={handleToggleSettings}
				loading={loading}
				errors={errors}
				showSettings={showSettings}
				sendToBackend={sendToBackend}
			/>

			{showSettings ? (
				<Settings
					rateLimit={rateLimit}
					settings={settings}
					sendToBackend={sendToBackend}
				/>
			) : (
				<Repositories
					repositories={repositories}
					settings={settings}
					onToggleSettings={handleToggleSettings}
					sendToBackend={sendToBackend}
				/>
			)}
		</div>
	);
}
