# Privacy Policy for GitHub Sidebar

Last updated: 2026-03-15

GitHub Sidebar is a Chrome extension that helps users bookmark GitHub repositories and view related pull requests and issues.

## Data this extension handles

- GitHub personal access token (if the user chooses to provide one)
- Repository shortcuts selected by the user (owner/repository names)
- Extension settings (for example update behavior, sorting, and sidebar preferences)
- Sidebar visibility preference

## How data is stored

All extension data is stored locally in the user's browser (`chrome.storage.local` and `localStorage`).
The developer does not operate a separate backend service for this extension.

## How data is used

If a token is provided, it is used only to authenticate requests to GitHub's API (`https://api.github.com/graphql`) to fetch pull request and issue data for repositories the user has chosen.

## Data sharing and transfers

- Data is sent only to GitHub's API to provide extension functionality.
- No analytics, advertising, or tracking services are used.
- No personal or sensitive user data is sold or shared with third parties.

## Limited Use statement

This extension uses Chrome extension permissions and user data only to provide its user-facing features, in line with the Chrome Web Store User Data Policy and Limited Use requirements.
