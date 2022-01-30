import React from 'react';
import Icons from '../../images/svgs/icons.js';
import { ago } from '../../utils/time.js';
import Read from '../Read/index.jsx';
import { isSelectedURL } from './utils.js';

export default class Item extends React.PureComponent {
	toggleRead = () => {
		this.props.sendToBackend({
			type: 'toggleRead',
			id: this.props.item.id,
		});
	};

	render() {
		const {
			item: {
				title,
				url,
				comments,
				updatedAt,
				createdAt,
				reviewStatus,
				author,
				read,
			},
			settings,
		} = this.props;

		const renderComments = () => {
			if (!comments) {
				return null;
			}
			return (
				<div className="comments">
					<Icons icon="comment" /> {comments}
				</div>
			);
		};

		const timeAgo =
			settings.sortBy === 'CREATED_AT'
				? `created ${ago(createdAt)} ago`
				: `updated ${ago(updatedAt)} ago`;

		const activeRepo = isSelectedURL(url);

		return (
			<li className="item">
				<div className="grid-1" />
				<div className="grid-1 no-gutters">
					<Read
						read={read}
						status={reviewStatus}
						toggleRead={this.toggleRead}
					/>
				</div>

				<div className={`grid listItem ${activeRepo}`}>
					<a href={url} title={title}>
						<div className="content text-truncate">
							<div className="top">
								<h5 className="text-truncate">{title}</h5>

								{renderComments()}
							</div>

							<span className="bottom">
								By {author}, {timeAgo}
							</span>
						</div>
					</a>
				</div>
			</li>
		);
	}
}
