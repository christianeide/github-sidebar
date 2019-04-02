import React from 'react'
import Pr from './pr.jsx'

export default class Item extends React.Component {
  render () {
    const { name, url, prs, totalItems, owner } = this.props.data
    return (
      <li className='repository'>
        <div className='heading'>
          <a href={url}>{owner}/{name}</a>
          <a href={`${url}/pulls`} className='link-muted'>{totalItems} PRs</a>
        </div>

        {prs.length > 0
          ? <ul>
            {prs.map(pr => {
              return <Pr
                pr={pr}
              />
            })}
          </ul>
          : null
        }
      </li>
    )
  }
}
