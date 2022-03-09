import React, { useRef, useState } from 'react';
import Type from './type.jsx';
import Icons from '../../images/svgs/icons.js';
import Read from '../Read/index.jsx';
import { repoHasUnreadItems } from '../../utils/utils.js';
import { isSelectedURL } from './utils.js';

const getOwnerURL = (url) => {
	// Remove last part of url (reponame) and return the rest
	return url.replace(new RegExp('(.*/)[^/]+$'), '$1');
};

const handleStopPropagation = (e) => {
	// Prevent collapse on click
	e.stopPropagation();
};

const calculateMaxHeight = (repo, repoHeight) => {
	let maxHeight = {};
	if (repo.collapsed) {
		maxHeight = { maxHeight: '0px' };
	} else if (repoHeight) {
		maxHeight = { maxHeight: `${repoHeight}px` };
	}
	return maxHeight;
};

export default function Repository(props) {
	const { repo, settings, sendToBackend } = props;

	const [hover, setHover] = useState(false);

	const repoHeightRef = useRef(null);

	const handleToggleCollapsed = () => {
		sendToBackend({
			type: 'toggleCollapsed',
			url: repo.url,
		});
	};

	const handleToggleHover = () => {
		setHover(!hover);
	};

	const toggleRead = (e) => {
		handleStopPropagation(e);

		const repoHasUnreads = repoHasUnreadItems(repo);

		sendToBackend({
			type: 'toggleRead',
			repo: repo.url,
			status: repoHasUnreads,
		});
	};

	const repoHeight = repoHeightRef?.current?.scrollHeight;

	const availableItems =
		settings.listItemOfType === 'all'
			? ['issues', 'pullRequests']
			: [settings.listItemOfType];

	const maxHeight = calculateMaxHeight(repo, repoHeight);

	const hasActiveElements =
		repo.totalItems.issues + repo.totalItems.pullRequests > 0;

	const items = availableItems.map((item) => {
		const totalItems = repo.totalItems[item];
		const typeText = item === 'pullRequests' ? 'pull requests' : item;
		return (
			<span key={item} title={`${totalItems} ${typeText}`}>
				{totalItems}
			</span>
		);
	});

	const repoCount = hasActiveElements && (
		<div className="repoCount">{items}</div>
	);

	const repoHasUnreads = repoHasUnreadItems(repo);
	const mouseoverText = repoHasUnreads
		? 'Mark repo as read'
		: 'Mark repo as unread';
	const activeRepo = isSelectedURL(repo.url);

	return (
		<li className={`repository ${repo.collapsed ? 'collapsed' : ''}`}>
			<div
				className={`repoHeading ${activeRepo} ${hover ? 'hideHover' : ''}`}
				onClick={handleToggleCollapsed}
				aria-label="Toggle visibility of items"
			>
				<div
					className="grid-1"
					onMouseEnter={handleToggleHover}
					onMouseLeave={handleToggleHover}
				>
					{hasActiveElements && (
						<Read
							read={!repoHasUnreads}
							title={mouseoverText}
							toggleRead={toggleRead}
						/>
					)}
				</div>

				<div className="grid-1 expand">
					<Icons icon="arrow" />
				</div>

				<div className="grid">
					<h3
						className="text-truncate"
						onMouseEnter={handleToggleHover}
						onMouseLeave={handleToggleHover}
					>
						<a
							href={getOwnerURL(repo.url)}
							onClick={handleStopPropagation}
							className="org"
							title={repo.owner}
						>
							{repo.owner}
						</a>
						<span>/</span>
						<a
							href={repo.url}
							onClick={handleStopPropagation}
							title={repo.name}
						>
							{repo.name}
						</a>
					</h3>

					{repoCount}
				</div>
			</div>

			<div className="items" style={maxHeight} ref={repoHeightRef}>
				{availableItems.map((type) => {
					return <Type key={type} type={type} {...props} />;
				})}
			</div>
		</li>
	);
}
