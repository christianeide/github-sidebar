export function isSelectedURL (itemURL) {
  const currentURL = getCurrentURL()
  return currentURL.match(itemURL) ? 'selected' : ''
}

function getCurrentURL () {
  return window.location.href
}
