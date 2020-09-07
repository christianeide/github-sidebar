import React from 'react';
import './read.scss';

export default function Read({ read, toggleRead, title, status = '' }) {
	const titleText = title || (read ? 'Mark as unread' : 'Mark as read');
	return (
		<div
			className={`readButton ${read ? 'read' : 'notRead'}`}
			onClick={toggleRead}
			title={titleText}
		>
			<div className={`color ${status}`} />
		</div>
	);
}
