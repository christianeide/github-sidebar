import React from 'react'
import Icons from '../../images/svgs/icons.js'
import { ago } from '../../js/time.js'

export default class Item extends React.Component {
  showComments (comments) {
    if (!comments) return null
    return (
      <div className='comments'>
        <Icons icon='comment' /> { comments }
      </div>
    )
  }

  render () {
    const { item: { title, url, comments, updatedAt, reviewStatus, author }, type } = this.props

    return (
      <li className={`listItem ${reviewStatus}`}>
        <a href={url}>

          <div className='itemIcon'>
            <Icons icon={type} />
          </div>

          <div className='content text-truncate'>
            <div className='top'>
              <h5 className='text-truncate'>
                {title}
              </h5>

              {this.showComments(comments)}
            </div>

            <span className='bottom'>
              By {author}, updated {ago(updatedAt)} ago
            </span>
          </div>

        </a>
      </li>
    )
  }
}
