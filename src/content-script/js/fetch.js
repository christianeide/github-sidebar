import axios from 'axios'
import { token } from '../../../testToken.js'

const graphqlQuery = `
query ($owner: String!, $name: String!) {
  repository(owner: $owner, name: $name) {
    name
    url
    owner {
      login
    }
    pullRequests(last: 20, states: OPEN) {
      edges {
        node {
          title
          url
          updatedAt
          reviews(last: 1) {
            nodes {
              state
            }
          }
          comments {
            totalCount
          }
        }
      }
    }
  }
}      
`

export function fetchDataFromAPI (repositories, callback) {
  axios.all(repositories.map(repo => {
    return axios({
      url: 'https://api.github.com/graphql',
      method: 'post',
      params: {
        access_token: token
      },
      data: {
        query: graphqlQuery,
        variables: {
          'owner': repo.owner,
          'name': repo.name
        }
      }
    })
  }))
    .then(axios.spread((...repositories) => {
      // all requests are now complete
      const updateRepoStatus = repositories.map(repository => {
        const repo = repository.data.data.repository

        // Mapping data from prs
        const prs = repo.pullRequests.edges.map(pr => {
          const { node } = pr
          return {
            title: node.title,
            url: node.url,
            reviewStatus: node.reviews.nodes.length > 0 ? node.reviews.nodes[0].state : null,
            updatedAt: node.updatedAt,
            comments: node.comments.totalCount
          }
        })

        return {
          name: repo.name,
          owner: repo.owner.login,
          url: repo.url,
          prs: prs
        }
      })

      return callback(updateRepoStatus)
    }))
}
