import React from 'react'
import './header.scss'
import Icons from '../../images/svgs/icons.js'
import Errors from './errors.jsx'
import Read from '../Read/index.jsx'

export default class Header extends React.Component {
  componentDidMount () {
    this.setHeight()
    window.addEventListener('resize', this.setHeight)
  }

  componentWillUnmount () {
    window.removeEventListener('resize', this.setHeight)
  }

  setHeight = () => {
    // Set the sidebar header height to same same as githubs header section
    const githubHeader = document.getElementsByClassName('js-header-wrapper')
    if (githubHeader.length > 0) {
      const height = githubHeader[0].offsetHeight

      this.setState({ height })
    }
  }

  toggleRead = () => {
    this.props.port.postMessage({ type: 'toggleRead' })
  }

  render () {
    const { loading, errors, toggleSettings, showSettings, port, hasUnread } = this.props

    const loader = loading && <Icons icon='loader' className='loader' />
    const icon = showSettings ? 'cancel' : 'settings'

    return (
      <header className='text-bold' style={{ height: this.state.height }}>
        <span className='align-center'>
          Github Sidebar

          {hasUnread && <Read title='Mark all as seen' toggleRead={this.toggleRead} />}
          {loader}
        </span>

        <span className='align-center'>
          <Errors errors={errors} port={port} />

          <a href='#' className='iconBtn' onClick={toggleSettings}>
            <Icons icon={icon} />
          </a>
        </span>
      </header>
    )
  }
}
