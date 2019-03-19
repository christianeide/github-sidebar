import React from 'react'

export default class Header extends React.Component {
  render () {
    return (
      <header className='text-bold'>
        Github Sidebar
        <a href='#' className='iconBtn'><i className='icon icon-gear' /></a>
      </header>
    )
  }
}
