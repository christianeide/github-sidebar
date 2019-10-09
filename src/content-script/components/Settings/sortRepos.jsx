import React from 'react'
import { SortableContainer, SortableElement } from 'react-sortable-hoc'

const SortableItem = SortableElement(({ item, removeRepo, listIndex }) =>
  <li className='listItem'>
    <div className='content text-truncate'>
      <div className='top'>
        <h5 className='text-truncate'>
          {item.owner}/{item.name}
        </h5>

        <div className='remove' onClick={removeRepo} data-index={listIndex}>
            &#10005;
        </div>
      </div>
    </div>
  </li>
)

const SortableList = SortableContainer(({ items, removeRepo }) => {
  return (
    <ul>
      {items.map((item, index) =>
        <SortableItem
          key={`${item.owner}/${item.name}`}
          item={item}
          listIndex={index}
          index={index}
          removeRepo={removeRepo}
        />
      )}
    </ul>
  )
})

export default function SortableComponent (props) {
  return <SortableList
    items={props.repos}
    onSortEnd={props.sortRepos}
    helperClass='github-sidebar-sort'
    removeRepo={props.removeRepo}
    pressDelay={100}
    lockAxis='y'
  />
}
