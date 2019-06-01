import Favico from 'favico.js'
const favicon = new Favico({
  animation: 'popFade',
  bgColor: '#ed4d4d',
  textColor: '#ed4d4d'
})

let OldUnReadStatus = false

export default function setBadge (repositories, showFavicon) {
  if (!showFavicon) {
    OldUnReadStatus = false
    return favicon.reset()
  }

  const hasUnread = hasUnreadItems(repositories)

  if (OldUnReadStatus !== hasUnread) {
    if (hasUnread) {
      favicon.badge('+')
    } else {
      favicon.reset()
    }

    OldUnReadStatus = hasUnread
  }
}

export function hasUnreadItems (repositories) {
  return repositories.findIndex(repos => {
    const issues = repos.issues.find(item => item.read === false)
    const pulls = repos.pullRequests.find(item => item.read === false)
    return pulls || issues
  }) > -1
}
