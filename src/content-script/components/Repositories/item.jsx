import React from 'react'
import Icons from '../../images/svgs/icons.js'
import { ago } from '../../js/time.js'

export default function Item (props) {
  function showComments (comments) {
    if (!comments) return null
    return (
      <div className='comments'>
        <Icons icon='comment' /> { comments }
      </div>
    )
  }

  function isStale (timeBeforeStale) {
    if (timeBeforeStale === 0) return ''

    const timeNow = new Date(updatedAt).getTime()
    const staleHoursInMS = timeBeforeStale * 3600000 // One hour is 3600000ms
    return (Date.now() - timeNow) < staleHoursInMS ? '' : 'STALE'
  }

  const { item: { title, url, comments, updatedAt, reviewStatus, author }, type, timeBeforeStale } = props

  let status = reviewStatus || isStale(timeBeforeStale)

  return (
    <li className={`listItem ${status}`}>
      <a href={url} title={title}>

        <div className='itemIcon'>
          <Icons icon={type} />
        </div>

        <div className='content text-truncate'>
          <div className='top'>
            <h5 className='text-truncate'>
              {title}
            </h5>

            {showComments(comments)}
          </div>

          <span className='bottom'>
              By {author}, updated {ago(updatedAt)} ago
          </span>
        </div>

      </a>
    </li>
  )
}
