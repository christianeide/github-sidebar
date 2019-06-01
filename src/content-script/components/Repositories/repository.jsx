import React from 'react'
import Item from './item.jsx'
import Icons from '../../images/svgs/icons.js'

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
    <div className={type}>
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

export default class Repository extends React.Component {
  constructor () {
    super()

    this.repoHeight = React.createRef()
  }

  toggleCollapsed = () => {
    this.props.port.postMessage({ type: 'toggleCollapsed', url: this.props.repo.url })
  }

  renderItems (availableItems) {
    return availableItems.map(type => {
      return <Type
        type={type}
        {...this.props}
      />
    })
  }

  getRepoHeight () {
    return this.repoHeight && this.repoHeight.current && this.repoHeight.current.scrollHeight
  }

  render () {
    const { repo, settings } = this.props

    let availableItems = settings.listItemOfType === 'all'
      ? ['issues', 'pullRequests']
      : [settings.listItemOfType]

    const name = `${repo.owner}/${repo.name}`
    const maxHeight = repo.collapsed ? 0 : this.getRepoHeight() + 'px'

    return (
      <li className={`repository ${repo.collapsed ? 'collapsed' : ''}`}>
        <div className='repoHeading'>
          <h3 className='text-truncate'>
            <a href={repo.url} className='text-truncate' title={name}>{name}</a>
          </h3>

          <Icons icon={'arrow'} onClick={this.toggleCollapsed} />
        </div>

        <div className='items' style={{ maxHeight }} ref={this.repoHeight}>
          {this.renderItems(availableItems)}
        </div>
      </li>
    )
  }
}
