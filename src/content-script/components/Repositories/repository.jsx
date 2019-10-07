import React from 'react'
import Item from './item.jsx'
import Icons from '../../images/svgs/icons.js'
import Read from '../Read/index.jsx'
import { repoHasUnreadItems } from "../../js/setBadge.js"

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

  const itemsShown = settings.numberOfItems >= repo.totalItems[type]
    ? ""
    : `${settings.numberOfItems} of `

  const totalNrItems = repo.totalItems[type]
  const nrOfItems = totalNrItems > 0 && `(${itemsShown}${repo.totalItems[type]})`
  
  const item = itemData[type]
  const url = `${repo.url}/${item.url}`

  return (
    <div className={type}>
      <div className='itemHeading'>
        <div className="grid-1"></div>
        
        <div className="grid-1">
          <Icons icon={type} />
        </div>

        <div className="grid">
          <h4>
            <a href={url}>{item.text} {nrOfItems}</a>
          </h4>
        </div>
      </div>

      {repo[type] && repo[type].length > 0 &&
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
    const { repo, settings, port } = this.props

    let availableItems = settings.listItemOfType === 'all'
      ? ['issues', 'pullRequests']
      : [settings.listItemOfType]

    const name = `${repo.owner}/${repo.name}`
    const maxHeight = repo.collapsed ? 0 : this.getRepoHeight() + 'px'

    const totalIssues = repo.totalItems.issues
    const totalPrs = repo.totalItems.pullRequests
    const hasActiveElements = totalIssues !== 0 || totalPrs !== 0

    const repoCount = hasActiveElements &&
      (  
      <div className="repoCount">
        <span title={`${totalIssues} issues`}>{totalIssues}</span>
        <span title={`${totalPrs} pull requests`}>{totalPrs}</span>
        </div>
      )
    
    const repoHasUnreads = repoHasUnreadItems(repo)

    const toggleRead = () => {
      port.postMessage({
        type: 'toggleRead',
        repo: repo.url,
        status: repoHasUnreads
      })
    }

    const mouseoverText = repoHasUnreads ? "Mark repo as read" : "Mark repo as unread"

    return (
      <li className={`repository ${repo.collapsed ? 'collapsed' : ''}`}>
        <div className='repoHeading'>
          <div className="grid-1">
           {hasActiveElements && <Read read={!repoHasUnreads} status={"DEFAULT"} title={mouseoverText} toggleRead={toggleRead} />}
          </div>
           
          <div className="grid-1 expand" onClick={this.toggleCollapsed}>
            <Icons icon={'arrow'}  />
          </div>
          
          <div className="grid">
            <h3 className='text-truncate'>
              <a href={repo.url} className='text-truncate' title={name}>{name}</a>
            </h3>

            {repoCount}
          </div>
        </div>

        <div className='items' style={{ maxHeight }} ref={this.repoHeight}>
          {this.renderItems(availableItems)}
        </div>
      </li>
    )
  }
}
