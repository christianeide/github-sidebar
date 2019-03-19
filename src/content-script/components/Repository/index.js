import React, { useState, useEffect } from 'react'

export default function Header () {
  // Declare a new state variable, which we'll call "count"
  const [count, setCount] = useState(0)

  useEffect(() => {
    // Update the document title using the browser API
    document.title = `You clicked ${count} times`
  })

  return (
    <header className='text-bold'>
      Github Sidebar
      {/* <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>
        Click me
      </button> */}
      <a href='#' className='iconBtn'><i className='icon icon-gear' /></a>
    </header>
  )
}
