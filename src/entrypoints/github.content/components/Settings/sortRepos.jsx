import React from 'react';

export default function SortRepos({ items, onRemoveRepo, onSortEnd }) {
	const onDrop = (event) => {
		const fromIndex = Number(event.dataTransfer.getData('text/plain'));
		const toIndex = Number(event.currentTarget.getAttribute('data-index'));
		event.preventDefault();

		if (
			Number.isNaN(fromIndex) ||
			Number.isNaN(toIndex) ||
			fromIndex === toIndex
		) {
			return;
		}

		onSortEnd({ oldIndex: fromIndex, newIndex: toIndex });
	};

	return (
		<ul>
			{items.map((item, index) => (
				<li
					key={`${item.owner}/${item.name}`}
					className="listItem"
					data-index={index}
					draggable
					onDragStart={(event) => {
						event.dataTransfer.effectAllowed = 'move';
						event.dataTransfer.setData('text/plain', String(index));
					}}
					onDragOver={(event) => event.preventDefault()}
					onDrop={onDrop}
				>
					<div className="content text-truncate">
						<div className="top">
							<h5 className="text-truncate">
								{item.owner} / {item.name}
							</h5>

							<button
								className="remove"
								onClick={onRemoveRepo}
								data-index={index}
								aria-label="Remove repo"
							>
								&#10005;
							</button>
						</div>
					</div>
				</li>
			))}
		</ul>
	);
}
