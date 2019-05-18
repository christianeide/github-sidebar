export function createPullRequestsQuery (repositories, type, numberOfItems, sortBy) {
  const repos = repositories.map((repo, index) => {
    return repositoriesQuery(repo, type, numberOfItems, sortBy, index)
  })

  return `query {
            rateLimit {
              limit
              remaining
              resetAt
            }
            ${repos}
          }`
}

function repositoriesQuery ({ owner, name }, type, numberOfItems, sortBy, index) {
  return `repo${index}: repository(owner: "${owner}", name: "${name}") {
            name
            url
            owner {
              login
            }
            ${types[type](numberOfItems, sortBy)}
          }`
}

const types = {
  pullRequests: (numberOfItems, sortBy) => {
    return `
      pullRequests(first: ${numberOfItems}, states: OPEN, orderBy: {field: ${sortBy}, direction: DESC}) {
        totalCount
        edges {
          node {
            id
            title
            url
            updatedAt
            createdAt
            author {
              login
            }
            reviews(last: 1, states: [APPROVED, CHANGES_REQUESTED, DISMISSED]) {
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
  `
  },
  issues: (numberOfItems, sortBy) => {
    return `
      issues(first: ${numberOfItems}, states: OPEN, orderBy: {field: ${sortBy}, direction: DESC}) {
        totalCount
        edges {
          node {
            id
            title
            url
            updatedAt
            createdAt
            author {
              login
            }
            comments {
              totalCount
            }
          }
        }
      }   
  `
  }
}
