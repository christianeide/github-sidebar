export function createPullRequestsQuery(repositories, numberOfItems, sortBy) {
	const repos = repositories.map((repo, index) => {
		return repositoriesQuery(repo, numberOfItems, sortBy, index);
	});

	return `query {
            rateLimit {
              limit
              remaining
              resetAt
            }
            viewer {
              login
            }
            ${repos}
          }`;
}

function repositoriesQuery({ owner, name }, numberOfItems, sortBy, index) {
	return `repo${index}: repository(owner: "${owner}", name: "${name}") {
            name
            url
            owner {
              login
            }
            issuesMaxNumber: issues(first: 1, orderBy: {field: CREATED_AT, direction: DESC}) {
              edges {
                node {
                  number
                }
              }
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
                  number
                  author {
                    login
                  }
                  comments {
                    totalCount
                  }
                }
              }
            }   

            pullRequestsMaxNumber: pullRequests(first: 1, orderBy: {field: CREATED_AT, direction: DESC}) {
              edges {
                node {
                  number
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
                  number
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
          }`;
}
