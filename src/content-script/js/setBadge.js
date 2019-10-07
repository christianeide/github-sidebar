import Favico from 'favico.js'
const favicon = new Favico({
  animation: 'popFade',
  bgColor: '#FDB23C',
  textColor: '#FDB23C'
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
  return repositories.find(repo => {
    return repoHasUnreadItems(repo)
  })
}

export function repoHasUnreadItems (repo) {
  if (!repo.issues || !repo.pullRequests) return false

  const issues = repo.issues.find(item => item.read === false)
  const pulls = repo.pullRequests.find(item => item.read === false)
  return typeof pulls !== 'undefined' || typeof issues !== 'undefined'
}
