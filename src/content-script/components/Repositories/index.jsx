import React from 'react';
import Repository from './repository.jsx';
import NoRepos from './noRepos.jsx';
import './repositories.scss';

export default function Repositories({
	repositories,
	onToggleSettings,
	settings,
	sendToBackend,
}) {
	if (repositories.length === 0) {
		return <NoRepos onToggleSettings={onToggleSettings} />;
	}

	return (
		<main>
			<ul className="repositories">
				{repositories.map((repo) => {
					return (
						<Repository
							key={repo.url}
							repo={repo}
							settings={settings}
							sendToBackend={sendToBackend}
						/>
					);
				})}
			</ul>
		</main>
	);
}
