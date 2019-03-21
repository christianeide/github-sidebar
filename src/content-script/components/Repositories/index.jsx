import React from 'react'
import Repository from './repository.jsx'

export default class Repositories extends React.Component {
  render () {
    console.log('render', this.props.repositories)
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
