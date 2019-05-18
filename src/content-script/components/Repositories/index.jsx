import React from 'react'
import Repository from './repository.jsx'
import NoRepos from './noRepos.jsx'
import './repositories.scss'

export default function Repositories (props) {
  const {
    repositories,
    toggleSettings,
    settings: {
      listItemOfType,
      numberOfItems,
      timeBeforeStale,
      sortBy
    },
    port
  } = props

  if (repositories.length === 0) {
    return <NoRepos toggleSettings={toggleSettings} />
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
            timeBeforeStale={timeBeforeStale}
            sortBy={sortBy}
            port={port}
          />
        })}
      </ul>
    </main>
  )
}
