
import React from 'react'
import ReactDOM from 'react-dom'

import './css/index.scss'

//* ********* React components **********/
import Header from './components/Header/index.jsx'
import Repositories from './components/Repositories/index.jsx'

//* ********* Functions **********/
import { fetchDataFromAPI } from './js/fetch.js'

class App extends React.Component {
  constructor () {
    super()

    this.state = {
      repositories: [
        {
          name: 'nora-core',
          owner: 'nrkno',
          url: 'https://github.com/nrkno/nora-core',
          prs: []
        },
        {
          name: 'nora-module-browser',
          owner: 'nrkno',
          url: 'https://github.com/nrkno/nora-module-browser',
          prs: []
        },
        {
          name: 'nora-render-nyheter',
          owner: 'nrkno',
          url: 'https://github.com/nrkno/nora-render-nyheter',
          prs: []
        }
      ]
    }
  }

  componentDidMount () {
    console.log('MOUNT1')

    fetchDataFromAPI(this.state.repositories, (repositories) => {
      this.setState({ repositories })
    })
  }

  render () {
    return (
      <React.Fragment>
        <Header />

        <Repositories
          repositories={this.state.repositories}
        />
      </React.Fragment>
    )
  }
}

const id = 'github-sidebar'
if (!document.getElementById(id)) {
  const appendDiv = document.createElement('div')
  appendDiv.id = id
  document.body.appendChild(appendDiv)
}

ReactDOM.render(<App />, document.getElementById(id))
