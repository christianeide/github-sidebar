import React, { useState } from 'react';
import AccessTokenEx from '../../images/accesstokenex.png';
import './index.scss';

export default function TokenPusher({ onChange, value }) {
	const [localToken, setLocalToken] = useState(value);

	const tokenInput = (
		<input
			type="text"
			name="token"
			className="tokenInput"
			value={localToken}
			onChange={(e) => setLocalToken(e.target.value)}
			onBlur={(e) => onChange(e)} // Set setting on blur and not on type to prevent jumping gui
			placeholder="Enter token"
		/>
	);

	// If we have a token, then we will return the normal inputfield
	if (value) {
		return (
			<label className="singleAccessToken">
				Access token
				{tokenInput}
			</label>
		);
	}

	return (
		<div className="accessTokenPusher">
			<h4>Access token</h4>
			<ul>
				<li>
					To enable all features of this extension, you need to generate an
					access token from Github.
				</li>
				<li>
					This will let the extension fetch data about your issues and pull
					requests to give you the best possible status of your repos.
				</li>
				<li>
					The token is only stored in your local browser and is used to
					communicate with Github`s API.
				</li>
			</ul>

			<img
				src={chrome.runtime.getURL(AccessTokenEx)}
				alt="Example of repo data that can be collected"
			/>

			<a
				className="ghs-btn"
				href="https://github.com/settings/tokens/new?scopes=repo&description=Github%20sidebar%20browser%20extension"
				target="_blank"
				rel="noopener noreferrer"
				role="button"
			>
				CREATE AN ACCESS TOKEN
			</a>
			<em>(The necessary scopes are pre-selected)</em>

			{tokenInput}
		</div>
	);
}
