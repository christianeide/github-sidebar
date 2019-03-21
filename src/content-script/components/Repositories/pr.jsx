import React from 'react'
import { commentIcon, pullRequestIcon } from '../../css/svgs.js'
import { ago } from '../../js/timeAgo.js'

export default class Pr extends React.Component {
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
    const { title, url, comments, updatedAt, reviewStatus, author } = this.props.pr

    return (
      <li className={`pr ${reviewStatus}`}>
        <a href={url}>

          <div className='pullIcon'>
            {pullRequestIcon}
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
