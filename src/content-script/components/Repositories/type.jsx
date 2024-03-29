import React from 'react';
import Item from './item.jsx';
import Icons from '../../images/svgs/icons.js';

export default function Type({ settings, sendToBackend, repo, type }) {
	const itemData = {
		issues: {
			text: 'Issues',
			url: 'issues',
		},
		pullRequests: {
			text: 'Pull requests',
			url: 'pulls',
		},
	};

	const itemsShown =
		settings.numberOfItems >= repo.totalItems[type]
			? ''
			: `${settings.numberOfItems} of `;

	const totalNrItems = repo.totalItems[type];
	const nrOfItems =
		totalNrItems > 0 && `(${itemsShown}${repo.totalItems[type]})`;

	const item = itemData[type];
	const url = `${repo.url}/${item.url}`;

	return (
		<div className={type}>
			<div className="itemHeading">
				<div className="grid-1" />

				<div className="grid-1">
					<Icons icon={type} />
				</div>

				<div className="grid">
					<h4>
						<a href={url}>
							{item.text} {nrOfItems}
						</a>
					</h4>
				</div>
			</div>

			{repo[type] && repo[type].length > 0 && (
				<ul>
					{repo[type].map((item) => {
						return (
							<Item
								key={item.id}
								item={item}
								type={type}
								sendToBackend={sendToBackend}
								settings={settings}
							/>
						);
					})}
				</ul>
			)}
		</div>
	);
}
