import axios from 'axios'
import {
  createPullRequestsQuery
} from './graphql/index.js'

export function fetchDataFromAPI (settings, callback) {
  if (!settings.token) return callback()

  const query = createPullRequestsQuery(settings.repos)

  console.log('fetchingdata', settings)

  axios({
    url: 'https://api.github.com/graphql',
    method: 'post',
    params: {
      access_token: settings.token
    },
    data: {
      query
    }
  })
    .then((result) => {
      const {
        rateLimit,
        ...repos
      } = result.data.data

      const updateRepoStatus = []
      Object.keys(repos).forEach((key) => {
        const repo = repos[key]

        // Mapping data from prs
        const prs = repo.pullRequests.edges.map(pr => {
          const {
            node
          } = pr
          return {
            title: node.title,
            url: node.url,
            reviewStatus: node.reviews.nodes.length > 0 ? node.reviews.nodes[0].state : null,
            updatedAt: node.updatedAt,
            comments: node.comments.totalCount,
            author: node.author.login
          }
        })

        updateRepoStatus.push({
          name: repo.name,
          owner: repo.owner.login,
          url: repo.url,
          prs: prs
        })
      })

      return callback(updateRepoStatus, rateLimit)
    })
}
