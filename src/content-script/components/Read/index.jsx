import { h } from 'preact'
import './read.scss'

const Read = ({ read, toggleRead, title, status }) => {
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

export default Read
