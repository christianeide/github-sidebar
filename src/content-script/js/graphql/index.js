
export function createPullRequestsQuery (repositories, type = 'pullRequests') {
  const repos = repositories.map((repo, index) => {
    return repositoriesQuery(repo, type, index)
  })

  return `query {
            rateLimit {
              cost
              limit
              remaining
              resetAt
            }
            ${repos}
          }`
}

function repositoriesQuery (repo, type, index) {
  return `repo${index}: repository(owner: "${repo.owner}", name: "${repo.name}") {
            name
            url
            owner {
              login
            }
            ${types[type]}
          }`
}

const types = {
  pullRequests: `
    pullRequests(last: 20, states: OPEN, orderBy: {field: UPDATED_AT, direction: DESC}) {
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
