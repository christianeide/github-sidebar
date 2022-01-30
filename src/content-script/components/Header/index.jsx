import React from 'react';
import './header.scss';
import Icons from '../../images/svgs/icons.js';
import Errors from './errors.jsx';

export default class Header extends React.PureComponent {
	componentDidMount() {
		this.setHeight();
		window.addEventListener('resize', this.setHeight);
	}

	componentWillUnmount() {
		window.removeEventListener('resize', this.setHeight);
	}

	setHeight = () => {
		// Set the sidebar header height to same same as githubs header section
		const githubHeader = document.getElementsByClassName('js-header-wrapper');
		if (githubHeader.length > 0) {
			const height = githubHeader[0].offsetHeight;

			this.setState({ height });
		}
	};

	toggleRead = () => {
		this.props.sendToBackend({ type: 'toggleRead' });
	};

	render() {
		const { loading, errors, onToggleSettings, showSettings, sendToBackend } =
			this.props;

		const loader = loading && <Icons icon="loader" className="loader" />;
		const icon = showSettings ? 'cancel' : 'settings';

		return (
			<header className="text-bold" style={{ height: this.state?.height }}>
				<span className="align-center">
					Github Sidebar
					{loader}
				</span>

				<span className="align-center">
					<Errors errors={errors} sendToBackend={sendToBackend} />

					<a
						href="#"
						className="iconBtn"
						aria-label={`${
							showSettings ? 'Show repositories' : 'Show settings'
						}`}
						onClick={onToggleSettings}
					>
						<Icons icon={icon} />
					</a>
				</span>
			</header>
		);
	}
}
