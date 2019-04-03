// From https://github.com/odyniec/tinyAgo-js

export function ago (time) {
  const d = new Date(time)
  let val = d.getTime()

  val = 0 | (Date.now() - val) / 1000
  return calculateTime(val)
}

export function until (time) {
  const d = new Date(time)
  let val = d.getTime()

  val = 0 | (val - Date.now()) / 1000
  return calculateTime(val)
}

function calculateTime (val) {
  const length = {
    second: 60,
    minute: 60,
    hour: 24,
    day: 7,
    week: 4.35,
    month: 12,
    year: 10000
  }

  for (let unit in length) {
    const result = val % length[unit]
    if (!(val = 0 | val / length[unit])) { return result + ' ' + (result - 1 ? unit + 's' : unit) }
  }
}
