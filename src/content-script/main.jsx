
import React from 'react'
import ReactDOM from 'react-dom'
import './css/index.scss'

//* ********* React components **********/
import Header from './components/Header/index.jsx'
import Repositories from './components/Repositories/index.jsx'

//* ********* Functions **********/

class App extends React.Component {
  constructor () {
    super()

    this.state = {
      repositories: []
    }
  }

  render () {
    return (
      <React.Fragment>
        <Header />
        <Repositories />
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
