import React from 'react'
import Item from './item.jsx'

export default function Repository (props) {
  const { data: { name, url, items, totalItems, owner }, type, numberOfItems } = props

  const item = type === 'pullRequests'
    ? {
      text: 'PR',
      url: 'pulls'
    }
    : {
      text: 'issue',
      url: 'issues'
    }

  const repoName = `${owner}/${name}`
  const nrItems = numberOfItems >= totalItems ? `` : `${numberOfItems} of`

  return (
    <li className='repository'>
      <div className='heading text-truncate'>
        <a href={url} className='text-truncate' title={repoName}>{repoName}</a>
        <a href={`${url}/${item.url}`} className='prLink'>{nrItems} {totalItems} {item.text}{totalItems === 1 ? '' : 's'}</a>
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
