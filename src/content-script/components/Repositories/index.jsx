/** @jsx h */
import { h } from 'preact'
import { PureComponent } from 'preact/compat'

import Repository from './repository.jsx'
import NoRepos from './noRepos.jsx'
import './repositories.scss'

export default class Repositories extends PureComponent {
  render () {
    const {
      repositories,
      onToggleSettings,
      settings,
      port
    } = this.props

    if (repositories.length === 0) {
      return <NoRepos onToggleSettings={onToggleSettings} />
    }

    return (
      <main>
        <ul className='repositories'>
          {repositories.map(repo => {
            return (
              <Repository
                key={repo.url}
                repo={repo}
                settings={settings}
                port={port}
              />
            )
          })}
        </ul>
      </main>
    )
  }
}
