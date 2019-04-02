import React from 'react'
import { commentIcon, typeIcons } from '../../css/svgs.js'
import { ago } from '../../js/time.js'

export default class Item extends React.Component {
  showComments (comments) {
    if (!comments) return null
    return (
      <div className='comments'>
        { commentIcon } { comments }
      </div>
    )
  }

  timeAgo (updatedAt) {
    const d = new Date(updatedAt)
    return ago(d.getTime())
  }

  render () {
    const { item: { title, url, comments, updatedAt, reviewStatus, author }, type } = this.props

    return (
      <li className={`listItem ${reviewStatus}`}>
        <a href={url}>

          <div className='pullIcon'>
            {typeIcons[type]}
          </div>

          <div className='content text-truncate'>
            <div className='top'>
              <h5 className='text-truncate'>
                {title}
              </h5>

              {this.showComments(comments)}
            </div>

            <span className='bottom'>
              By {author}, updated {this.timeAgo(updatedAt)} ago
            </span>
          </div>

        </a>
      </li>
    )
  }
}
