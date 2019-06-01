import React from 'react'
import Item from './item.jsx'

function Type ({ settings, port, repo, type }) {
  const itemData = {
    issues: {
      text: 'Issues',
      url: 'issues'
    },
    pullRequests: {
      text: 'Pull requests',
      url: 'pulls'
    }
  }

  const nrOfItems = settings.numberOfItems >= repo.totalItems[type]
    ? null
    : <React.Fragment><span className='counter'>{settings.numberOfItems}</span> of </React.Fragment>

  const item = itemData[type]
  const url = `${repo.url}/${item.url}`

  return (
    <div>
      <div className='itemHeading'>
        <h4> <a href={url}>{item.text}</a></h4>
        <div>
          {nrOfItems}
          <span className='counter'> {repo.totalItems[type]}</span>
        </div>
      </div>

      {repo[type].length > 0 &&
        <ul>
          {repo[type].map(item => {
            return <Item
              item={item}
              type={type}
              port={port}
              settings={settings}
            />
          })}
        </ul>}
    </div>
  )
}

export default function Repository (props) {
  const { repo, settings } = props

  let availableItems = settings.listItemOfType === 'all'
    ? ['issues', 'pullRequests']
    : [settings.listItemOfType]

  const renderItems = availableItems.map(type => {
    return <Type
      type={type}
      {...props}
    />
  })

  const name = `${repo.owner}/${repo.name}`
  return (
    <li className='repository'>
      <h3 className='text-truncate'>
        <a href={repo.url} className='text-truncate' title={name}>{name}</a>
      </h3>

      {renderItems}
    </li>
  )
}
