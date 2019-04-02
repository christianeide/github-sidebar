import React from 'react'
import Item from './item.jsx'

export default class Repository extends React.Component {
  render () {
    const { data: { name, url, items, totalItems, owner }, type } = this.props

    const item = type === 'pullRequests'
      ? {
        text: 'PRs',
        url: '/pulls'
      }
      : {
        text: 'issues',
        url: '/issues'
      }

    return (
      <li className='repository'>
        <div className='heading text-truncate'>
          <a href={url} className='text-truncate'>{owner}/{name}</a>
          <a href={`${url}/${item.url}`} className='link-muted'>{totalItems} {item.text}</a>
        </div>

        {items.length > 0
          ? <ul>
            {items.map(item => {
              return <Item item={item} type={type} />
            })}
          </ul>
          : null
        }
      </li>
    )
  }
}
