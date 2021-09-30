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

		this.port = chrome.runtime.connect();
		this.listenToBackground = null;
	}

	componentDidMount() {
		// Get preloaded data
		this.port.postMessage({ type: 'init' });
		// Set up listener for new messages
		this.listenToBackground = this.port.onMessage.addListener((newState) => {
			this.setState({ ...newState });
		});
	}

	componentDidUpdate() {
		setBadge(this.state.repositories, this.showFavicon());
	}

	componentWillUnmount() {
		this.port.onMessage.removeListener(this.listenToBackground);
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
		const {
			showSettings,
			settings,
			loading,
			errors,
			rateLimit,
			repositories,
		} = this.state;

		if (!settings) {
			return null;
		}

		if (!settings.token) {
			return <Splash port={this.port} />;
		}

		return (
			<div className={`sidebar ${settings.theme}`}>
				<Header
					onToggleSettings={this.handleToggleSettings}
					loading={loading}
					errors={errors}
					showSettings={showSettings}
					port={this.port}
				/>

				{showSettings ? (
					<Settings
						rateLimit={rateLimit}
						settings={settings}
						port={this.port}
					/>
				) : (
					<Repositories
						repositories={repositories}
						settings={settings}
						onToggleSettings={this.handleToggleSettings}
						port={this.port}
					/>
				)}
			</div>
		);
	}
}
