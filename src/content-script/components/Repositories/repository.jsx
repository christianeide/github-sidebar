/** @jsx h */
import { h, createRef } from 'preact'
import { PureComponent } from 'preact/compat'
import Item from './item.jsx'
import Icons from '../../images/svgs/icons.js'
import Read from '../Read/index.jsx'
import { repoHasUnreadItems } from '../../js/setBadge.js'

class Type extends PureComponent {
  render () {
    const { settings, port, repo, type } = this.props

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
      ? ''
      : `${settings.numberOfItems} of `

    const totalNrItems = repo.totalItems[type]
    const nrOfItems = totalNrItems > 0 && `(${itemsShown}${repo.totalItems[type]})`

    const item = itemData[type]
    const url = `${repo.url}/${item.url}`

    return (
      <div className={type}>
        <div className='itemHeading'>
          <div className='grid-1' />

          <div className='grid-1'>
            <Icons icon={type} />
          </div>

          <div className='grid'>
            <h4>
              <a href={url}>{item.text} {nrOfItems}</a>
            </h4>
          </div>
        </div>

        {repo[type] && repo[type].length > 0 &&
          <ul>
            {repo[type].map(item => {
              return (
                <Item
                  item={item}
                  type={type}
                  port={port}
                  settings={settings}
                />
              )
            })}
          </ul>}
      </div>
    )
  }
}

export default class Repository extends PureComponent {
  constructor () {
    super()

    this.state = {
      repoHeight: 0,
      hover: false
    }
    this.repoHeight = createRef()
  }

  componentDidUpdate () {
    const repoHeight = this.getRepoHeight()
    if (repoHeight !== this.state.repoHeight) {
      this.setState({ repoHeight })
    }
  }

  toggleCollapsed = () => {
    this.props.port.postMessage({ type: 'toggleCollapsed', url: this.props.repo.url })
  }

  toggleHover =() => {
    this.setState({ hover: !this.state.hover })
  }

  stopPropagation (e) {
    // Prevent collapse on click
    e.stopPropagation()
  }

  renderItems (availableItems) {
    return availableItems.map(type => {
      return (
        <Type
          type={type}
          {...this.props}
        />
      )
    })
  }

  getRepoHeight () {
    return this.repoHeight && this.repoHeight.current && this.repoHeight.current.scrollHeight
  }

  toggleRead = (e) => {
    e.stopPropagation()

    const { repo, port } = this.props
    const repoHasUnreads = repoHasUnreadItems(repo)

    port.postMessage({
      type: 'toggleRead',
      repo: repo.url,
      status: repoHasUnreads
    })
  }

  getOwnerURL (url) {
    // Remove last part of url (reponame) and return the rest
    return url.replace(new RegExp('(.*/)[^/]+$'), '$1')
  }

  render () {
    const { repo, settings } = this.props
    const { repoHeight } = this.state

    const availableItems = settings.listItemOfType === 'all'
      ? ['issues', 'pullRequests']
      : [settings.listItemOfType]

    let maxHeight = {}
    if (repo.collapsed) {
      maxHeight = { maxHeight: '0px' }
    } else if (repoHeight) {
      maxHeight = { maxHeight: `${repoHeight}px` }
    }

    const hasActiveElements = repo.totalItems.issues + repo.totalItems.pullRequests > 0

    const items = availableItems.map(item => {
      const totalItems = repo.totalItems[item]
      const typeText = item === 'pullRequests' ? 'pull requests' : item
      return (<span title={`${totalItems} ${typeText}`}>{totalItems}</span>)
    })

    const repoCount = hasActiveElements &&
      (
        <div className='repoCount'>
          {items}
        </div>
      )

    const repoHasUnreads = repoHasUnreadItems(repo)
    const mouseoverText = repoHasUnreads ? 'Mark repo as read' : 'Mark repo as unread'

    return (
      <li className={`repository ${repo.collapsed ? 'collapsed' : ''}`}>
        <div className={`repoHeading ${this.state.hover && 'hideHover'}`} onClick={this.toggleCollapsed}>
          <div className='grid-1' onMouseEnter={this.toggleHover} onMouseLeave={this.toggleHover}>
            {hasActiveElements && <Read read={!repoHasUnreads} status='DEFAULT' title={mouseoverText} toggleRead={this.toggleRead} />}
          </div>

          <div className='grid-1 expand'>
            <Icons icon='arrow' />
          </div>

          <div className='grid'>
            <h3 className='text-truncate' onMouseEnter={this.toggleHover} onMouseLeave={this.toggleHover}>
              <a
                href={this.getOwnerURL(repo.url)} onClick={this.stopPropagation} className='org'
                title={repo.owner}
              >
                {repo.owner}
              </a>
              <span>/</span>
              <a
                href={repo.url} onClick={this.stopPropagation}
                title={repo.name}
              >
                {repo.name}
              </a>
            </h3>

            {repoCount}
          </div>
        </div>

        <div className='items' style={maxHeight} ref={this.repoHeight}>
          {this.renderItems(availableItems)}
        </div>
      </li>
    )
  }
}
