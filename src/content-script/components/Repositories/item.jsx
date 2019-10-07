import React from 'react'
import Icons from '../../images/svgs/icons.js'
import { ago } from '../../js/time.js'
import Read from '../Read/index.jsx'

export default function Item (props) {
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
  } = props

  const renderComments = () => {
    if (!comments) return null
    return (
      <div className='comments'>
        <Icons icon='comment' /> {comments}
      </div>
    )
  }

  const isStale = () => {
    if (settings.timeBeforeStale === 0) return ''

    const timeNow = new Date(updatedAt).getTime()
    const staleHoursInMS = settings.timeBeforeStale * 3600000 // One hour is 3600000ms
    return (Date.now() - timeNow) < staleHoursInMS ? '' : 'STALE'
  }

  const toggleRead = () => {
    port.postMessage({ type: 'toggleRead', id })
  }

  const status = reviewStatus || isStale()

  const timeAgo = settings.sortBy === 'CREATED_AT'
    ? `created ${ago(createdAt)} ago`
    : `updated ${ago(updatedAt)} ago`

  return (
    <li className='item'>
      <div className='grid-1' />
      <div className='grid-1 no-gutters'>
        <Read read={read} status={status} toggleRead={toggleRead} />
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
