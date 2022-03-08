import React from 'react';
import SortRepos from './sortRepos.jsx';
import { until } from '../../utils/time.js';
import arrayMove from 'array-move';
import { getCurrentPath, canAddRepository } from './getPath.js';
import './settings.scss';
import { debounce } from '../../utils/utils.js';
import { convertMsToSec, convertSecToMs } from '../../../common';
import TokenPusher from '../TokenPusher';

export default class Settings extends React.Component {
	constructor(props) {
		super(props);

		// We copy parent props to state only on mount of component
		// We use theese props as a startingpoint when we edit settings
		this.state = {
			...props.settings,
			settingsSaved: false,
		};

		this.timer = null;
		this.mainContRef = React.createRef();
	}

	componentWillUnmount() {
		// Save settings when we go back
		this.saveSettings();

		clearTimeout(this.timer);
	}

	componentDidUpdate() {
		if (this.state.settingsSaved) {
			// Clear timer before we start a new
			if (this.timer) {
				clearTimeout(this.timer);
				this.timer = null;
			}

			// Set a timer to show the save confirmation for a given time in ms
			this.timer = setTimeout(() => {
				this.setState({ settingsSaved: false });

				this.timer = null;
			}, 2000);
		}
	}

	handleInputChange = (event) => {
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

		this.setState({ [name]: value }, () => {
			this.handleSaveSettings();
		});
	};

	handleValidateInput = (event) => {
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

		this.setState({ [name]: value }, () => {
			this.handleSaveSettings();
		});
	};

	handleAddPage = () => {
		const repo = getCurrentPath();

		if (!repo) {
			return;
		}

		this.setState(
			({ repos }) => ({
				repos: [...repos, repo],
			}),
			() => {
				this.handleSaveSettings();
			}
		);
	};

	handleSortRepos = ({ oldIndex, newIndex }) => {
		this.setState(
			({ repos }) => ({
				repos: arrayMove(repos, oldIndex, newIndex),
			}),
			() => {
				this.handleSaveSettings();
			}
		);
	};

	handleRemoveRepo = (e) => {
		const indexToRemove = parseInt(e.target.getAttribute('data-index'));

		this.setState(
			({ repos }) => ({
				repos: repos.filter((repo, index) => index !== indexToRemove),
			}),
			() => {
				this.handleSaveSettings();
			}
		);
	};

	handleSaveSettings = debounce(() => {
		this.saveSettings();
	}, 1000);

	saveSettings = () => {
		this.props.sendToBackend({ type: 'saveSettings', settings: this.state });
		this.setState({ settingsSaved: true });
	};

	getRef = () => this.mainContRef;

	setRef = (el) => {
		this.mainContRef = el;
	};

	render() {
		const { rateLimit } = this.props;
		const {
			repos,
			listItemOfType,
			numberOfItems,
			autoRefresh,
			updateFavicon,
			token,
			sortBy,
			theme,
			settingsSaved,
		} = this.state;

		const remaing =
			token && rateLimit ? (
				<em>
					({rateLimit.remaining} requests left of {rateLimit.limit}. Resets in{' '}
					{until(rateLimit.resetAt)})
				</em>
			) : null;

		const canAddRepo = canAddRepository(repos);

		return (
			<main className="settings" ref={this.setRef}>
				<ul>
					<li className="list">
						<h4>Repositories</h4>
						<p>
							Navigate to a Github-repository you want to monitor and click the
							button below.
						</p>
						<button
							className="sidebar-button add"
							onClick={this.handleAddPage}
							disabled={!canAddRepo}
							title={canAddRepo ? '' : 'Already added'}
						>
							Add current repository
						</button>

						<SortRepos
							items={repos}
							onSortEnd={this.handleSortRepos}
							helperClass="github-sidebar-sort"
							onRemoveRepo={this.handleRemoveRepo}
							pressDelay={100}
							lockAxis="y"
							helperContainer={this.getRef}
						/>
					</li>

					<TokenPusher value={token} onChange={this.handleInputChange} />

					<li className="list miscellaneous">
						<h4>Options</h4>

						<label>
							Theme
							<select
								name="theme"
								value={theme}
								onChange={this.handleInputChange}
							>
								<option value="dark">Dark</option>
								<option value="light">Light</option>
							</select>
						</label>

						<label>
							Show items from
							<select
								name="listItemOfType"
								value={listItemOfType}
								disabled={!token}
								onChange={this.handleInputChange}
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
								onChange={this.handleInputChange}
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
								onChange={this.handleInputChange}
								onBlur={this.handleValidateInput}
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
								onChange={this.handleInputChange}
								disabled={!token}
							/>
						</label>

						<label>
							<input
								type="checkbox"
								name="updateFavicon"
								checked={updateFavicon}
								disabled={!token}
								onChange={this.handleInputChange}
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
}
