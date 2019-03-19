
import React from 'react'
import ReactDOM from 'react-dom'

import './css/index.scss'

import Header from './header.js'

//* ********* React components **********/

//* ********* Functions **********/

const log = require('debug')('log:Content-Script main') // eslint-disable-line no-unused-vars

export default class App extends React.Component {
  constructor () {
    super()

    this.state = {
    }
  }

  componentDidMount () {
    console.log('componentdidmount')
    // chrome.storage.local.set({ key: 'hei' }, function () {
    //   console.log('Value is set to ' + 'hei')
    // })
    // setInterval(() => {
    //   console.log('hei hei')
    //   chrome.storage.local.get(['key'], function (result) {
    //     console.log('Value currently is ' + result.key)
    //   })
    // }, 2000)
  }

  render () {
    return (
      <React.Fragment>
        <Header />

        <main>
          <ul>
            <li><a href='https://github.com/nrkno/nora-core'>nora-core</a></li>
            <li><a href='https://github.com/nrkno/nora-module-browser'>nora-nodule-browser</a></li>
            <li><a href='https://github.com/nrkno/nora-render-nyheter'>nora-render-nyheter</a></li>
          </ul>
        </main>
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
