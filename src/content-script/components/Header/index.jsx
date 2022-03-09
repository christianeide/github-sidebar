import React, { useEffect, useState } from 'react';
import './header.scss';
import Icons from '../../images/svgs/icons.js';
import Errors from './errors.jsx';

export default function Header(props) {
	const [height, setHeight] = useState();

	const calculateHeight = () => {
		// Set the sidebar header height to same same as githubs header section
		const githubHeader = document.getElementsByClassName('js-header-wrapper');
		if (githubHeader.length > 0) {
			const height = githubHeader[0].offsetHeight;

			setHeight(height);
		}
	};

	useEffect(() => {
		calculateHeight();
		window.addEventListener('resize', calculateHeight);

		return () => window.removeEventListener('resize', calculateHeight);
	}, []);

	const { loading, errors, onToggleSettings, showSettings, sendToBackend } =
		props;

	const loader = loading && <Icons icon="loader" className="loader" />;
	const icon = showSettings ? 'cancel' : 'settings';

	return (
		<header className="text-bold" style={{ height }}>
			<span className="align-center">
				Github Sidebar
				{loader}
			</span>

			<span className="align-center">
				<Errors errors={errors} sendToBackend={sendToBackend} />

				<a
					href="#"
					className="iconBtn"
					aria-label={`${showSettings ? 'Show repositories' : 'Show settings'}`}
					onClick={onToggleSettings}
				>
					<Icons icon={icon} />
				</a>
			</span>
		</header>
	);
}
