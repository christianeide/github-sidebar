import {Component, h, createRef} from 'preact'
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

export default class Repository extends Component {
  constructor () {
    super()

    this.state = {
      repoHeight: 0
    }
    this.repoHeight = createRef()
  }

  componentDidUpdate() {
    const repoHeight = this.getRepoHeight()
    if (repoHeight !== this.state.repoHeight) {
      this.setState({ repoHeight })
    }
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
    const { repoHeight } = this.state

    let availableItems = settings.listItemOfType === 'all'
      ? ['issues', 'pullRequests']
      : [settings.listItemOfType]

    const name = `${repo.owner}/${repo.name}`

    let maxHeight = {}
    if (repo.collapsed) {
      maxHeight = { maxHeight: '0px' }
    } else if(repoHeight) {
      maxHeight = { maxHeight: `${repoHeight}px` }
    }

    const hasActiveElements = repo.totalItems.issues + repo.totalItems.pullRequests > 0

    const items = availableItems.map(item => {
      const totalItems = repo.totalItems[item]
      const typeText = item === "pullRequests" ? "pull requests" : item
      return (<span title={`${totalItems} ${typeText}`}>{totalItems}</span>)
    })

    const repoCount = hasActiveElements &&
      (  
        <div className="repoCount">
          {items}
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

        <div className='items' style={maxHeight} ref={this.repoHeight}>
          {this.renderItems(availableItems)}
        </div>
      </li>
    )
  }
}
