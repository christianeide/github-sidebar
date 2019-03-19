import React from 'react'

export default class Item extends React.Component {
  render () {
    const { name } = this.props
    return (
      <li><a href={`https://github.com/${name}`}>{name}</a></li>
    )
  }
}
