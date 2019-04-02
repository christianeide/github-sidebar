import axios from 'axios'
import { createPullRequestsQuery } from './graphql/index.js'

export function fetchDataFromAPI ({ token, repos, listItemOfType, numberOfItems }, callback) {
  if (!token) return callback()

  const query = createPullRequestsQuery(repos, listItemOfType, numberOfItems)

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
      console.log('fetched data: ', result)

      const { rateLimit, ...repos } = result.data.data

      const updateRepoStatus = []
      Object.keys(repos).forEach((key) => {
        const repo = repos[key]

        // Mapping data from items
        const items = repo[listItemOfType].edges.map(({ node }) => {
          return {
            title: node.title,
            url: node.url,
            reviewStatus: node.review && node.reviews.nodes.length > 0 ? node.reviews.nodes[0].state : null,
            updatedAt: node.updatedAt,
            comments: node.comments.totalCount,
            author: node.author.login
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

      return callback(updateRepoStatus, rateLimit)
    })
}
