import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import { alerts, parseReadings, worstFirst } from './readings.js'

const shipped = () => JSON.parse(readFileSync(new URL('../public/data.json', import.meta.url)))

test('the shipped data.json is valid', () => {
  assert.ok(parseReadings(shipped()).boxes.length > 0)
})

test('bad data is refused with a message that names the problem', () => {
  const swapped = shipped()
  swapped.site = { lat: swapped.site.lon, lon: swapped.site.lat }
  assert.throws(() => parseReadings(swapped), /site\.lat/)

  const quoted = shipped()
  quoted.site.lat = '13.6849'
  assert.throws(() => parseReadings(quoted), /site\.lat/)

  const typo = shipped()
  typo.boxes[0].status = 'warn'
  assert.throws(() => parseReadings(typo), /unknown status "warn"/)

  assert.throws(() => parseReadings({ site: shipped().site }), /lists/)
})

test('alerts keep only watch and above, worst first', () => {
  const boxes = ['notread', 'watch', 'ok', 'critical', 'norule', 'warning'].map((status) => ({ status }))
  assert.deepEqual(
    alerts(boxes).map((box) => box.status),
    ['critical', 'warning', 'watch'],
  )
  assert.equal(worstFirst(boxes)[0].status, 'critical')
  assert.equal(boxes[0].status, 'notread', 'the input list is not reordered')
})
