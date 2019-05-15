let index = 0
let ports = {}

export function add (port) {
  let id = index
  ports[id] = port

  port.onDisconnect.addListener(() => {
    remove(id)
  })

  index++
}
export function remove (id) {
  delete ports[id]
}
export function messageAll (message) {
  for (let id in ports) {
    ports[id].postMessage(message)
  }
}
