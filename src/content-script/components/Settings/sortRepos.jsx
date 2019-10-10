import { h } from 'preact'
import { SortableContainer, SortableElement } from 'react-sortable-hoc'

const SortableItem = SortableElement(({ item, onRemoveRepo, listIndex }) =>
  <li className='listItem'>
    <div className='content text-truncate'>
      <div className='top'>
        <h5 className='text-truncate'>
          {item.owner}/{item.name}
        </h5>

        <div className='remove' onClick={onRemoveRepo} data-index={listIndex}>
            &#10005;
        </div>
      </div>
    </div>
  </li>
)

const SortableList = SortableContainer(({ items, onRemoveRepo }) => {
  return (
    <ul>
      {items.map((item, index) =>
        <SortableItem
          key={`${item.owner}/${item.name}`}
          item={item}
          listIndex={index}
          index={index}
          onRemoveRepo={onRemoveRepo}
        />
      )}
    </ul>
  )
})

export default function SortableComponent (props) {
  return (
    <SortableList
      items={props.repos}
      onSortEnd={props.onSortRepos}
      helperClass='github-sidebar-sort'
      onRemoveRepo={props.onRemoveRepo}
      pressDelay={100}
      lockAxis='y'
    />
  )
}
