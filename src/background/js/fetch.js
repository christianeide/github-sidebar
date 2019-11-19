import axios from 'axios'
import { createPullRequestsQuery } from './graphql.js'
import { autoRemoveRepo } from '../background.js'

export function fetchDataFromAPI ({
  token,
  repos,
  numberOfItems,
  sortBy
}, callback) {
  if (!numberOfItems) return

  const query = createPullRequestsQuery(repos, numberOfItems, sortBy)

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
          if (item.type === 'NOT_FOUND') {
            // Repos are named 'repo{number}' in graphql-kalls
            const missingRepoNumber = Number(item.path[0].replace('repo', ''))

            autoRemoveRepo(missingRepoNumber)

            return {
              title: 'Error in API query to Github ',
              message: `${item.message} Will now autoremove repo from list.`,
              time: Date.now()
            }
          }

          return {
            title: 'Error in API query to Github ',
            message: item.message,
            time: Date.now()
          }
        })

        return callback(userError)
      }

      const { rateLimit, viewer, ...repos } = result.data.data

      const updateRepoStatus = []
      Object.keys(repos).forEach((key) => {
        const repo = repos[key]

        // Mapping data from items
        const issues = listItems(repo, 'issues', viewer)
        const pullRequests = listItems(repo, 'pullRequests', viewer)

        updateRepoStatus.push({
          name: repo.name,
          owner: repo.owner.login,
          url: repo.url,
          collapsed: true,
          totalItems: {
            issues: repo.issues.totalCount,
            pullRequests: repo.pullRequests.totalCount
          },
          issues,
          pullRequests
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
function listItems (repo, type, { login }) {
  return repo[type].edges.map(({ node: item }) => {
    return {
      id: item.id,
      title: item.title,
      url: item.url,
      reviewStatus: item.reviews && item.reviews.nodes.length > 0 ? item.reviews.nodes[0].state : null,
      updatedAt: item.updatedAt,
      createdAt: item.createdAt,
      comments: item.comments.totalCount,
      // If extensionholder and itemauthor is the same, we  set it to read
      read: item.author.login === login,
      author: item.author.login
    }
  })
}
