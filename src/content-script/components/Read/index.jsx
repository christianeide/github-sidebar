import React from 'react'
import './read.scss'

const Circle = ({ read, toggleRead, title, status }) => {
  const titleText = title || (read ? 'Mark as read' : 'Mark as unread')
  return (
    <div
      className={`readButton ${read ? 'read' : 'notRead'}`}
      onClick={toggleRead}
      title={titleText}
    >
      <div className={`color ${status}`} />
    </div>
  )
}

export default Circle
