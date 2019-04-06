import React from 'react'
import './header.scss'

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
    const loader = this.props.loading ? <div class='icon-loader'><div /><div /><div /><div /></div> : null

    return (
      <header className='text-bold' style={{ height: this.state.height }}>
        <span>
        Github Sidebar
          {loader}
        </span>
        <a href='#' className='iconBtn' onClick={this.props.showSettings}>
          <i className='icon icon-gear' />
        </a>
      </header>
    )
  }
}
