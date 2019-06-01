export function createPullRequestsQuery (repositories, numberOfItems, sortBy) {
  const repos = repositories.map((repo, index) => {
    return repositoriesQuery(repo, numberOfItems, sortBy, index)
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

function repositoriesQuery ({
  owner,
  name
}, numberOfItems, sortBy, index) {
  return `repo${index}: repository(owner: "${owner}", name: "${name}") {
            name
            url
            owner {
              login
            }
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
          }`
}
