import React, { useEffect, useRef, useState, useCallback } from 'react';
import SortRepos from './sortRepos.jsx';
import { until } from '../../utils/time.js';
import { arrayMoveImmutable } from 'array-move';
import { getCurrentPath, canAddRepository } from './getPath.js';
import './settings.scss';
import { debounce } from '../../utils/utils.js';
import { convertMsToSec, convertSecToMs } from '../../../common';
import TokenPusher from '../TokenPusher';

export default function Settings({
	settings: defaultSettings,
	sendToBackend,
	rateLimit,
}) {
	// We copy parent props to state only on mount of component
	// We use theese props as a startingpoint when we edit settings
	const [settings, setSettings] = useState(() => defaultSettings);
	const [settingsSaved, setSettingsSaved] = useState(false);

	let mainContRef = useRef(null);

	const saveSettings = useCallback(
		(newSettings) => {
			sendToBackend({ type: 'saveSettings', settings: newSettings });
			setSettingsSaved(true);
		},
		[sendToBackend],
	);

	useEffect(() => {
		let timerTimeout;
		if (settingsSaved) {
			// Set a timer to show the save confirmation for a given time in ms
			timerTimeout = setTimeout(() => {
				setSettingsSaved(false);
			}, 2000);
		}

		return () => clearTimeout(timerTimeout);
	}, [settingsSaved]);

	const handleInputChange = (event) => {
		const target = event.target;
		const name = target.name;

		let value;
		switch (target.type) {
			case 'checkbox':
				value = target.checked;
				break;
			case 'number':
				value = target.value ? parseInt(target.value) : '';

				if (name === 'autoRefresh') {
					value = convertSecToMs(value);
				}
				break;
			default:
				value = target.value;
		}

		const newSettings = { ...settings, [name]: value };
		setSettings(newSettings);
		handleSaveSettings(newSettings);
	};

	const handleValidateInput = (event) => {
		function imposeMinMax(el) {
			const min = parseInt(el.min);
			const max = parseInt(el.max);

			if (el.value !== '') {
				const value = parseInt(el.value);
				if (value < min) {
					return min;
				}
				if (value > max) {
					return max;
				}
				return value;
			}

			return min || 0;
		}

		const target = event.target;
		const name = target.name;
		const value = imposeMinMax(target);

		const newSettings = { ...settings, [name]: value };
		setSettings(newSettings);
		handleSaveSettings(newSettings);
	};

	const handleAddPage = () => {
		const repo = getCurrentPath();

		if (!repo) {
			return;
		}

		const newSettings = {
			...settings,
			repos: [...settings.repos, repo],
		};

		setSettings(newSettings);
		handleSaveSettings(newSettings);
	};

	const handleSortRepos = ({ oldIndex, newIndex }) => {
		const newSettings = {
			...settings,
			repos: arrayMoveImmutable(settings.repos, oldIndex, newIndex),
		};

		setSettings(newSettings);
		handleSaveSettings(newSettings);
	};

	const handleRemoveRepo = (e) => {
		const indexToRemove = parseInt(e.target.getAttribute('data-index'));

		const newSettings = {
			...settings,
			repos: settings.repos.filter((repo, index) => index !== indexToRemove),
		};

		setSettings(newSettings);
		handleSaveSettings(newSettings);
	};

	const handleSaveSettings = debounce(
		(newSettings) => saveSettings(newSettings),
		1000,
	);

	const {
		repos,
		listItemOfType,
		numberOfItems,
		autoRefresh,
		updateFavicon,
		token,
		sortBy,
	} = settings;

	const remaing =
		token && rateLimit ? (
			<em>
				({rateLimit.remaining} requests left of {rateLimit.limit}. Resets in{' '}
				{until(rateLimit.resetAt)})
			</em>
		) : null;

	const canAddRepo = canAddRepository(repos);

	const getRef = () => mainContRef;
	const setRef = (el) => {
		mainContRef = el;
	};

	return (
		<main className="settings" ref={setRef}>
			<ul>
				<li className="list">
					<h4>Repositories</h4>
					<p>
						Navigate to a Github-repository you want to monitor and click the
						button below.
					</p>
					<button
						className="sidebar-button add"
						onClick={handleAddPage}
						disabled={!canAddRepo}
						title={canAddRepo ? '' : 'Already added'}
					>
						Add current repository
					</button>

					<SortRepos
						items={repos}
						onSortEnd={handleSortRepos}
						helperClass="github-sidebar-sort"
						onRemoveRepo={handleRemoveRepo}
						pressDelay={100}
						lockAxis="y"
						helperContainer={getRef}
					/>
				</li>

				<TokenPusher value={token} onChange={handleInputChange} />

				<li className="list miscellaneous">
					<h4>Options</h4>

					<label>
						Show items from
						<select
							name="listItemOfType"
							value={listItemOfType}
							disabled={!token}
							onChange={handleInputChange}
						>
							<option value="all">Pull requests and issues</option>
							<option value="pullRequests">Pull requests</option>
							<option value="issues">Issues</option>
						</select>
					</label>

					<label>
						Sort items by
						<select
							name="sortBy"
							value={sortBy}
							onChange={handleInputChange}
							disabled={!token}
						>
							<option value="CREATED_AT">Created</option>
							<option value="UPDATED_AT">Updated</option>
						</select>
					</label>

					<label>
						Number of items to load
						<input
							type="number"
							name="numberOfItems"
							min="0"
							max="10"
							value={numberOfItems}
							onChange={handleInputChange}
							onBlur={handleValidateInput}
							disabled={!token}
						/>
					</label>

					<label>
						Get repo data every X minutes
						<input
							type="number"
							name="autoRefresh"
							min="1"
							value={convertMsToSec(autoRefresh)}
							onChange={handleInputChange}
							disabled={!token}
						/>
					</label>

					<label>
						<input
							type="checkbox"
							name="updateFavicon"
							checked={updateFavicon}
							disabled={!token}
							onChange={handleInputChange}
						/>{' '}
						Highlight favicon if new/updated items?
					</label>

					{remaing}

					<div className="credit">
						<a href="https://github.com/christianeide/github-sidebar">
							Github Sidebar {process.env.npm_package_version}
						</a>
					</div>
				</li>
			</ul>

			{
				<div className={`autoSave ${settingsSaved && 'show'}`}>
					Settings saved...
				</div>
			}
		</main>
	);
}
