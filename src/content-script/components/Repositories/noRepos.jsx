import React from 'react'

export default class NoRepos extends React.Component {
  render () {
    const { showSettings } = this.props

    return (
      <main className='noRepos'>
        <div className='justifier'>
          <h3>No repositories added</h3>
          <p>Navigate to a Github-repository you want to monitor
                and add the repository from the <a href='#' onClick={showSettings}>settings page</a>.</p>
        </div>
      </main>
    )
  }
}
