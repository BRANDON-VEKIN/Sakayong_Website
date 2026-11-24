// Worst first: this order sorts the alert strip and picks the map pin's colour.
export const STATUS = {
  critical: 'Critical',
  warning: 'Warning',
  watch: 'Watch',
  ok: 'OK',
  norule: 'No rule',
  notread: 'Not read',
}

const rank = (status) => Object.keys(STATUS).indexOf(status)

export const worstFirst = (boxes) => boxes.toSorted((a, b) => rank(a.status) - rank(b.status))

export const alerts = (boxes) => worstFirst(boxes).filter((box) => rank(box.status) < rank('ok'))

const isCoordinate = (n, max) => typeof n === 'number' && Math.abs(n) <= max

// A typo in the data must show as an error: a misspelt "warning" would otherwise vanish from the page.
export function parseReadings(data) {
  const { site, layers, boxes } = data
  if (!isCoordinate(site?.lat, 90) || !isCoordinate(site?.lon, 180)) {
    throw new Error('site.lat and site.lon must be numbers in range')
  }
  if (!Array.isArray(layers) || !Array.isArray(boxes)) {
    throw new Error('layers and boxes must be lists')
  }
  for (const { title, status } of boxes) {
    if (!Object.hasOwn(STATUS, status)) throw new Error(`${title}: unknown status "${status}"`)
  }
  return data
}
