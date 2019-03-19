import React from 'react'
import Repository from './item.jsx'
// import axios from 'axios'

const reps = [
  'nrkno/nora-core',
  'nrkno/nora-render-nyheter',
  'nrkno/nora-module-browser'
]

// useEffect(() => {
//   axios('https://randomuser.me/api/?results=10')
//     .then(response =>
//       response.data.results.map(user => ({
//         name: `${user.name.first} ${user.name.last}`,
//         username: `${user.login.username}`,
//         email: `${user.email}`,
//         image: `${user.picture.thumbnail}`
//       }))
//     )
//     .then(data => {
//       setUsers(data)
//     })
// }, [])

export default class Repositories extends React.Component {
  render () {
    return (
      <main>
        <ul>
          {reps.map(rep => {
            return <Repository name={rep} key={rep} />
          })

          }
        </ul>
      </main>
    )
  }
}
