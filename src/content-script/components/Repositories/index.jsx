import { h } from 'preact'

import Repository from './repository.jsx'
import NoRepos from './noRepos.jsx'
import './repositories.scss'

export default function Repositories ({
  repositories,
  toggleSettings,
  settings,
  port
}) {
  if (repositories.length === 0) {
    return <NoRepos toggleSettings={toggleSettings} />
  }

  return (
    <main>
      <ul className='repositories'>
        {repositories.map(repo => {
          return <Repository
            key={repo.url}
            repo={repo}
            settings={settings}
            port={port}
                 />
        })}
      </ul>
    </main>
  )
}
