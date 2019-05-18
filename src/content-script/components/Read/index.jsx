import React from 'react'
import './read.scss'

const Circle = ({ read, toggleRead, title = 'Mark as seen' }) => {
  return (
    <div className={`circleButton ${read ? 'read' : 'notRead'}`} onClick={toggleRead} title={title}>
      <div className='circle' />
    </div>
  )
}

export default Circle
