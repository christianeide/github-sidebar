import { createPullRequestsQuery } from '../graphql.js';

describe('graphql', () => {
	it('should have an initial setup', () => {
		const repo = { owner: 'githubuser', name: 'reponame' };
		const repositories = [repo, repo];
		const numberOfItems = 4;
		const sortBy = 'CREATED_AT';
		const graphqlData = createPullRequestsQuery(
			repositories,
			numberOfItems,
			sortBy
		);
		expect(graphqlData).toMatchInlineSnapshot(`
		"query {
		            rateLimit {
		              limit
		              remaining
		              resetAt
		            }
		            viewer {
		              login
		            }
		            repo0: repository(owner: \\"githubuser\\", name: \\"reponame\\") {
		            name
		            url
		            owner {
		              login
		            }
		            issues(first: 4, states: OPEN, orderBy: {field: CREATED_AT, direction: DESC}) {
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

		            pullRequests(first: 4, states: OPEN, orderBy: {field: CREATED_AT, direction: DESC}) {
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
		          },repo1: repository(owner: \\"githubuser\\", name: \\"reponame\\") {
		            name
		            url
		            owner {
		              login
		            }
		            issues(first: 4, states: OPEN, orderBy: {field: CREATED_AT, direction: DESC}) {
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

		            pullRequests(first: 4, states: OPEN, orderBy: {field: CREATED_AT, direction: DESC}) {
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
		          }
		          }"
	`);
	});
});
