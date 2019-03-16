
import React from 'react'
import ReactDOM from 'react-dom'

import './css/index.scss'

//* ********* React components **********/

//* ********* Functions **********/

const log = require('debug')('log:Content-Script main') // eslint-disable-line no-unused-vars

export default class App extends React.Component {
  constructor () {
    super()

    this.state = {
    }
  }

  render () {
    return (
      <ul className={'react-extension'}>
        <li><a href='https://github.com/nrkno/nora-core'>Nora Core</a></li>
        <li><a href='https://github.com/nrkno/nora-module-browser'>Nora Module Browser</a></li>
        <li><a href='https://github.com/nrkno/nora-render-nyheter'>Nora Render Nyheter</a></li>
      </ul>
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
