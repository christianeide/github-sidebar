import React from 'react'
import Repository from './repository.jsx'
import NoRepos from './noRepos.jsx'
import './repositories.scss'

export default class Repositories extends React.Component {
  render () {
    console.log('render', this.props.repositories)
    if (this.props.repositories.length === 0) {
      return <NoRepos showSettings={this.props.showSettings} />
    }

    return (
      <main>
        <ul className='repositories'>
          {this.props.repositories.map(repo => {
            return <Repository
              data={repo}
              key={repo.url}
              type={this.props.type}
              numberOfItems={this.props.settings.numberOfItems}
            />
          })}
        </ul>
      </main>
    )
  }
}
