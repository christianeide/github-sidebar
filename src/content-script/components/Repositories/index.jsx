import React from 'react'
import Repository from './repository.jsx'

export default class Repositories extends React.Component {
  render () {
    console.log('render', this.props.repositories)
    if (this.props.repositories.length === 0) return null

    return (
      <main>
        <ul className='repositories'>
          {this.props.repositories.map(repo => {
            return <Repository data={repo} key={repo.url} />
          })}
        </ul>
      </main>
    )
  }
}
