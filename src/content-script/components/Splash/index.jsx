import React from 'react';
import Icons from '../../images/svgs/icons.js';
import './splash.scss';

export default class Splash extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			token: '',
		};
	}

	handleInputChange = (event) => {
		this.setState({ token: event.target.value });
	};

	handleSaveToken = () => {
		this.props.port.postMessage({ type: 'saveSettings', settings: this.state });
	};

	render() {
		const { token } = this.state;

		const tokenIsValid = token.match(/^\w{40}$/);

		return (
			<div className="sidebar">
				<main className="splash">
					<div className="justifier">
						<Icons icon="logo" />

						<p>
							This extension requires an access token from Github to load data.{' '}
						</p>
						<p>
							<a
								href="https://github.com/settings/tokens/new?scopes=repo&description=Github%20sidebar%20browser%20extension"
								target="_blank"
								rel="noopener noreferrer"
							>
								CREATE AN ACCESS TOKEN
							</a>
							<em>(The necessary scopes are pre-selected)</em>
						</p>

						<label>
							Paste the token below:
							<input
								type="text"
								name="token"
								value={token}
								onChange={this.handleInputChange}
								placeholder="Access token"
							/>
						</label>

						<button onClick={this.handleSaveToken} disabled={!tokenIsValid}>
							Save token
						</button>
					</div>
				</main>
			</div>
		);
	}
}
