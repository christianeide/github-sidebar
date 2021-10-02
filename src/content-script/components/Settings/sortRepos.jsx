import React from 'react';
import { SortableContainer, SortableElement } from 'react-sortable-hoc';

const SortableItem = SortableElement(({ item, onRemoveRepo, listIndex }) => (
	<li className="listItem">
		<div className="content text-truncate">
			<div className="top">
				<h5 className="text-truncate">
					{item.owner} / {item.name}
				</h5>

				<button
					className="remove"
					onClick={onRemoveRepo}
					data-index={listIndex}
					aria-label="Remove repo"
				>
					&#10005;
				</button>
			</div>
		</div>
	</li>
));

const SortableList = SortableContainer(({ items, onRemoveRepo }) => {
	return (
		<ul>
			{items.map((item, index) => (
				<SortableItem
					key={`${item.owner}/${item.name}`}
					item={item}
					listIndex={index}
					index={index}
					onRemoveRepo={onRemoveRepo}
				/>
			))}
		</ul>
	);
});

export default SortableList;
