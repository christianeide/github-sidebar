import React from 'react'
import Pr from './pr.jsx'

export default class Item extends React.Component {
  render () {
    const { name, url, items, totalItems, owner } = this.props.data
    return (
      <li className='repository'>
        <div className='heading text-truncate'>
          <a href={url} className='text-truncate'>{owner}/{name}</a>
          <a href={`${url}/pulls`} className='link-muted'>{totalItems} PRs</a>
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
