import React from 'react'
import Repository from './item.jsx'

export default class Repositories extends React.Component {
  render () {
    console.log('render', this.props.repositories)
    return (
      <main>
        <ul>
          {this.props.repositories.map(repo => {
            return <Repository data={repo} key={repo.url} />
          })}
        </ul>
      </main>
    )
  }
}
