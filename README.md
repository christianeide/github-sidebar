# GitHub Sidebar

Do you often navigate between several repositories on GitHub? This Chrome Extension lets you bookmark repositories in a sidebar injected only on GitHub pages. The sidebar will let you navigate faster and give you better control over your most used repositories. 

The extension can be installed through the [Chrome Web Store](https://chrome.google.com/webstore/detail/github-sidebar/lblnbldblpeiikndppnekobccdocccho)

**Features**

- Easy to bookmark and navigate repositories
- Overview over active Pull requests or Issues for your repos
- Periodically checks for new or updated items
- Optional to show badge in GitHub favicon if new items
- Loads fast, only 85kb
- Works across multiple tabs
- Color coding of items based on status (Approved, Closed)

## Screenshots
![](images/screen1.png)
![](images/multiple.png)


# Settings

### Repositories

Simply navigate to any Github repository you would like to add a shortcut to and press the button for *Add current repository*.

You can sort the order of repositories by simply drag&drop.

### Access Token

This extension requires an access token from Github to load data. Please [create an access token](https://github.com/settings/tokens/new?scopes=repo&description=Github%20sidebar%20browser%20extension)  to allow this extension to fetch necessary data from Github. The necessary scopes for the token is already selected if you follow the link above. All you need is to press "Generate Token", and copy/paste the token into the extension.

**Note:** The token is only saved to your browsers local *chrome.storage.local* and only used to communicate with Githubs API.

### Other settings
Should (hopefully) be pretty self explanatory
