/** @jsx h */
import { h, createRef } from 'preact'
import { PureComponent } from 'preact/compat'
import Type from './type.jsx'
import Icons from '../../images/svgs/icons.js'
import Read from '../Read/index.jsx'
import { repoHasUnreadItems } from '../../js/setBadge.js'

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

  handleToggleCollapsed = () => {
    this.props.port.postMessage({ type: 'toggleCollapsed', url: this.props.repo.url })
  }

  handleToggleHover =() => {
    this.setState({ hover: !this.state.hover })
  }

  handleStopPropagation (e) {
    // Prevent collapse on click
    e.stopPropagation()
  }

  renderItems (availableItems) {
    return availableItems.map(type => {
      return (
        <Type
          key={type}
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

  calculateMaxHeight = (repo) => {
    const { repoHeight } = this.state

    let maxHeight = {}
    if (repo.collapsed) {
      maxHeight = { maxHeight: '0px' }
    } else if (repoHeight) {
      maxHeight = { maxHeight: `${repoHeight}px` }
    }
    return maxHeight
  }

  render () {
    const { repo, settings } = this.props

    const availableItems = settings.listItemOfType === 'all'
      ? ['issues', 'pullRequests']
      : [settings.listItemOfType]

    const maxHeight = this.calculateMaxHeight(repo)

    const hasActiveElements = repo.totalItems.issues + repo.totalItems.pullRequests > 0

    const items = availableItems.map(item => {
      const totalItems = repo.totalItems[item]
      const typeText = item === 'pullRequests' ? 'pull requests' : item
      return (<span key={item} title={`${totalItems} ${typeText}`}>{totalItems}</span>)
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
        <div className={`repoHeading ${this.state.hover && 'hideHover'}`} onClick={this.handleToggleCollapsed}>
          <div className='grid-1' onMouseEnter={this.handleToggleHover} onMouseLeave={this.handleToggleHover}>
            {hasActiveElements && <Read read={!repoHasUnreads} status='DEFAULT' title={mouseoverText} toggleRead={this.toggleRead} />}
          </div>

          <div className='grid-1 expand'>
            <Icons icon='arrow' />
          </div>

          <div className='grid'>
            <h3 className='text-truncate' onMouseEnter={this.handleToggleHover} onMouseLeave={this.handleToggleHover}>
              <a
                href={this.getOwnerURL(repo.url)} onClick={this.handleStopPropagation} className='org'
                title={repo.owner}
              >
                {repo.owner}
              </a>
              <span>/</span>
              <a
                href={repo.url} onClick={this.handleStopPropagation}
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
