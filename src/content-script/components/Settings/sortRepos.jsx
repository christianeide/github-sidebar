import React from 'react'
import { SortableContainer, SortableElement } from 'react-sortable-hoc'

const SortableItem = SortableElement(({ item, removeRepo, index }) =>
  <li className='listItem'>
    <div className='content text-truncate'>
      <div className='top'>
        <h5 className='text-truncate'>
          {item.owner}/{item.name}
        </h5>

        <div className='remove' onClick={removeRepo} data-index={index}>
            &#10005;
        </div>
      </div>
    </div>
  </li>)

const SortableList = SortableContainer(({ items, removeRepo }) => {
  return (
    <ul>
      {items.map((item, index) => (
        <SortableItem key={`${item.owner}/${item.name}`} index={index} item={item} removeRepo={removeRepo} />
      ))}
    </ul>
  )
})

export default class SortableComponent extends React.Component {
  render () {
    return <SortableList
      items={this.props.repos}
      onSortEnd={this.props.sortRepos}
      helperClass='github-sidebar-sort'
      removeRepo={this.props.removeRepo}
      pressDelay={150}
    />
  }
}
