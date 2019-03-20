import React from 'react'

export default class Pr extends React.Component {
  render () {
    const { title, url, comments, reviewStatus, updatedAt } = this.props.pr
    return (
      <li style={{ padding: '1rem' }}>
        <a href={url}>{title}</a> |
        {comments}  |
        {reviewStatus} |
        {updatedAt}
      </li>
    )
  }
}
