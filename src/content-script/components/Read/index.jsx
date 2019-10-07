import React from 'react'
import './read.scss'

const Circle = ({ read, toggleRead, title = 'Mark as seen', status }) => {
  return (
    <div
      className={`readButton ${read ? 'read' : 'notRead'}`}
      onClick={toggleRead}
      title={title}
    >
      <div className={`color ${status}`} />
    </div>
  )
}

export default Circle
