import React from 'react'
import Pr from './pr.jsx'

export default class Item extends React.Component {
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
            {items.map(pr => {
              return <Pr
                pr={pr}
              />
            })}
          </ul>
          : null
        }
      </li>
    )
  }
}
