const query = `
query ($owner: String!, $name: String!) {
  rateLimit {
    cost
    limit
    remaining
    resetAt
  }
  repository(owner: $owner, name: $name) {
    name
    url
    owner {
      login
    }
    pullRequests(last: 20, states: OPEN, orderBy: {field: UPDATED_AT, direction: DESC}) {
      edges {
        node {
          title
          url
          updatedAt
          author {
            login
          }
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

export {
  query
}
