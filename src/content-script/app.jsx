import React from 'react';
import Header from './components/Header/index.jsx';
import Repositories from './components/Repositories/index.jsx';
import Settings from './components/Settings/index.jsx';
import Splash from './components/Splash/index.jsx';
import setBadge from './utils/setBadge';

export default class App extends React.Component {
	constructor() {
		super();

		this.state = {
			repositories: [],
			errors: [],
			rateLimit: undefined,
			showSettings: false,
			settings: undefined,
			loading: false,
		};
	}

	componentDidMount() {
		// Get preloaded data
		this.sendToBackend({ type: 'init' }, (initialState) => {
			this.setState({ ...initialState });
		});

		// Set up listener for new messages
		chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
			this.setState({ ...request });
		});
	}

	sendToBackend(message, cb = null) {
		chrome.runtime.sendMessage(message, cb);
	}

	componentDidUpdate() {
		setBadge(this.state.repositories, this.showFavicon());
	}

	showFavicon() {
		return this.state.settings && this.state.settings.updateFavicon;
	}

	handleToggleSettings = (e) => {
		if (e) {
			e.preventDefault();
		}
		this.setState({ showSettings: !this.state.showSettings });
	};

	render() {
		const { showSettings, settings, loading, errors, rateLimit, repositories } =
			this.state;

		if (!settings) {
			return null;
		}

		if (!settings.token) {
			return <Splash sendToBackend={this.sendToBackend} />;
		}

		return (
			<div className={`sidebar ${settings.theme}`}>
				<Header
					onToggleSettings={this.handleToggleSettings}
					loading={loading}
					errors={errors}
					showSettings={showSettings}
					sendToBackend={this.sendToBackend}
				/>

				{showSettings ? (
					<Settings
						rateLimit={rateLimit}
						settings={settings}
						sendToBackend={this.sendToBackend}
					/>
				) : (
					<Repositories
						repositories={repositories}
						settings={settings}
						onToggleSettings={this.handleToggleSettings}
						sendToBackend={this.sendToBackend}
					/>
				)}
			</div>
		);
	}
}
