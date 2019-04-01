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

  setHeight =() => {
    const height = document.getElementsByClassName('Header-old')[0].offsetHeight

    this.setState({ height })
  }

  render () {
    return (
      <header className='text-bold' style={{ height: this.state.height }}>
        Github Sidebar
        <a href='#' className='iconBtn' onClick={this.props.showSettings}>
          <i className='icon icon-gear' />
        </a>
      </header>
    )
  }
}
