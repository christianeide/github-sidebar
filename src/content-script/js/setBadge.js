import Favico from 'favico.js'
const favicon = new Favico({
  animation: 'popFade',
  bgColor: '#ed4d4d',
  textColor: '#ed4d4d'
})

let oldUndreadStatus = -1

export default function setBadge (repositories, showFavicon) {
  if (!showFavicon) {
    oldUndreadStatus = -1
    return favicon.reset()
  }

  const hasUnread = repositories.findIndex(repos => {
    return repos.items.find(item => item.read === false)
  })

  if (oldUndreadStatus !== hasUnread) {
    if (hasUnread !== -1) {
      favicon.badge('+')
    } else {
      favicon.reset()
    }

    oldUndreadStatus = hasUnread
  }
}
