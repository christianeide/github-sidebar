import Favico from 'favico.js'
const favicon = new Favico({
  animation: 'popFade',
  bgColor: '#ed4d4d',
  textColor: '#ed4d4d',
  position: 'up'
})

let oldUndreadStatus = -1

export default function setBadge (repositories) {
  const hasUnread = repositories.findIndex(repos => {
    return repos.items.find(item => item.read === false)
  })

  if (oldUndreadStatus !== hasUnread) {
  // 0 removes the badge
    const value = hasUnread !== -1 ? '+' : 0
    favicon.badge(value)

    oldUndreadStatus = hasUnread
  }
}
