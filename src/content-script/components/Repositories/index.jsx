import React from 'react'
import Repository from './repository.jsx'
import NoRepos from './noRepos.jsx'
import './repositories.scss'

export default function Repositories (props) {
  const {
    repositories,
    showSettings,
    settings: {
      listItemOfType,
      numberOfItems
    }
  } = props

  console.log('render', repositories)

  if (repositories.length === 0) {
    return <NoRepos showSettings={showSettings} />
  }

  return (
    <main>
      <ul className='repositories'>
        {repositories.map(repo => {
          return <Repository
            data={repo}
            key={repo.url}
            type={listItemOfType}
            numberOfItems={numberOfItems}
          />
        })}
      </ul>
    </main>
  )
}
