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
    // Githubs header item
    const height = document.getElementsByClassName('Header-old')[0].offsetHeight

    this.setState({ height })
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
