import React from 'react'
import Icons from '../../images/svgs/icons.js'
import { ago } from '../../js/time.js'
import Read from '../Read/index.jsx'

export default class Item extends React.PureComponent {
  toggleRead = () => {
    this.props.port.postMessage({
      type: 'toggleRead', id: this.props.item.id
    })
  }

  render() {

    const {
      item: {
        id,
        title,
        url,
        comments,
        updatedAt,
        createdAt,
        reviewStatus,
        author,
        read
      },
      settings,
      port
    } = this.props

    const renderComments = () => {
      if (!comments) return null
      return (
        <div className='comments'>
          <Icons icon='comment' /> {comments}
        </div>
      )
    }

    // If we dont have a review of this element yet, then we set it to default color
    const status = reviewStatus || 'DEFAULT'

    const timeAgo = settings.sortBy === 'CREATED_AT'
      ? `created ${ago(createdAt)} ago`
      : `updated ${ago(updatedAt)} ago`

    return (
      <li className='item'>
        <div className='grid-1' />
        <div className='grid-1 no-gutters'>
          <Read read={read} status={status} toggleRead={this.toggleRead} />
        </div>

        <div className='grid listItem'>
          <a href={url} title={title}>

            <div className='content text-truncate'>
              <div className='top'>
                <h5 className='text-truncate'>
                  {title}
                </h5>

                {renderComments()}
              </div>

              <span className='bottom'>
                By {author}, {timeAgo}
              </span>
            </div>

          </a>
        </div>
      </li>
    )
  }
}
