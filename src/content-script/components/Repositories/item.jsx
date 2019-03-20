import React from 'react'
import Pr from './pr.jsx'

export default class Item extends React.Component {
  render () {
    const { name, url, prs } = this.props.data
    return (
      <li>
        <a href={url}>{name}</a>
        <a href={`${url}/pulls`}>{prs.length} PRs</a>
        {prs.map(pr => {
          return <Pr
            pr={pr}
          />
        })}
      </li>
    )
  }
}
