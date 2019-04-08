import React from 'react'
import './header.scss'
import Icons from '../../images/svgs/icons.js'
import Errors from './errors.jsx'

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

  render () {
    const { loading, errors, clearErrors, showSettings } = this.props

    const loader = loading ? <Icons icon='loader' className='loader' /> : null

    return (
      <header className='text-bold' style={{ height: this.state.height }}>
        <span className='align-center'>
        Github Sidebar
          {loader}
        </span>
        <span className='align-center'>
          <Errors
            errors={errors}
            clearErrors={clearErrors}
          />

          <a href='#' className='iconBtn' onClick={showSettings}>
            <Icons icon='settings' />
          </a>
        </span>
      </header>
    )
  }
}
