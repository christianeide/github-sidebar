/* global chrome */

import React from 'react'
import Icons from '../../images/svgs/icons.js'
import { ago } from '../../js/time.js'

export default function Item (props) {
  const { item: { id, title, url, comments, updatedAt, reviewStatus, author, read }, type, timeBeforeStale } = props

  const renderComments = () => {
    if (!comments) return null
    return (
      <div className='comments'>
        <Icons icon='comment' /> { comments }
      </div>
    )
  }

  const isStale = () => {
    if (timeBeforeStale === 0) return ''

    const timeNow = new Date(updatedAt).getTime()
    const staleHoursInMS = timeBeforeStale * 3600000 // One hour is 3600000ms
    return (Date.now() - timeNow) < staleHoursInMS ? '' : 'STALE'
  }

  const toggleRead = () => {
    chrome.runtime.sendMessage({ type: 'toggleRead', id })
  }

  const status = reviewStatus || isStale()
  const isRead = read ? 'read' : 'notRead'

  return (
    <li className={`listItem ${status}`}>
      <div className={`circleButton ${isRead}`} onClick={toggleRead} title='New item'>
        <div className='circle' />
      </div>

      <a href={url} title={title}>

        <div className='itemIcon'>
          <Icons icon={type} />
        </div>

        <div className='content text-truncate'>
          <div className='top'>
            <h5 className='text-truncate'>
              {title}
            </h5>

            {renderComments()}
          </div>

          <span className='bottom'>
              By {author}, updated {ago(updatedAt)} ago
          </span>
        </div>

      </a>
    </li>
  )
}
