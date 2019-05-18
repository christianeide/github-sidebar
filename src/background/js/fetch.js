import axios from 'axios'
import { createPullRequestsQuery } from './graphql.js'

export function fetchDataFromAPI ({
  token,
  repos,
  listItemOfType,
  numberOfItems,
  sortBy
}, callback) {
  const query = createPullRequestsQuery(repos, listItemOfType, numberOfItems, sortBy)

  axios({
    url: 'https://api.github.com/graphql',
    method: 'post',
    params: {
      access_token: token
    },
    data: {
      query
    }
  })
    .then((result) => {
      if (result.data.errors) {
        const userError = result.data.errors.map(item => {
          return {
            title: 'Error in API query to Github ',
            message: item.message,
            time: Date.now()
          }
        })

        return callback(userError)
      }

      const { rateLimit, ...repos } = result.data.data

      const updateRepoStatus = []
      Object.keys(repos).forEach((key) => {
        const repo = repos[key]

        // Mapping data from items
        const items = repo[listItemOfType].edges.map(({ node: item }) => {
          return {
            id: item.id,
            title: item.title,
            url: item.url,
            reviewStatus: item.reviews && item.reviews.nodes.length > 0 ? item.reviews.nodes[0].state : null,
            updatedAt: item.updatedAt,
            createdAt: item.createdAt,
            comments: item.comments.totalCount,
            read: false,
            author: item.author.login
          }
        })

        updateRepoStatus.push({
          name: repo.name,
          owner: repo.owner.login,
          url: repo.url,
          totalItems: repo[listItemOfType].totalCount,
          items
        })
      })

      return callback(null, updateRepoStatus, rateLimit)
    })
    .catch((error, msg) => {
      // If we dont have a error resonse, its probably a network error.
      // We dont want to flood users with network errors
      if (!error.response) return

      const userError = [{
        title: error.message,
        message: error.response.data.message,
        time: Date.now()
      }]

      return callback(userError)
    })
}
