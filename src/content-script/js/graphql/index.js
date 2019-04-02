
export function createPullRequestsQuery (repositories, type, numberOfItems) {
  const repos = repositories.map((repo, index) => {
    return repositoriesQuery(repo, type, numberOfItems, index)
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

function repositoriesQuery ({ owner, name }, type, numberOfItems, index) {
  return `repo${index}: repository(owner: "${owner}", name: "${name}") {
            name
            url
            owner {
              login
            }
            ${types[type](numberOfItems)}
          }`
}

const types = {
  pullRequests: (numberOfItems) => {
    return `
      pullRequests(last: ${numberOfItems}, states: OPEN, orderBy: {field: UPDATED_AT, direction: DESC}) {
        totalCount
        edges {
          node {
            title
            url
            updatedAt
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
  }
}
