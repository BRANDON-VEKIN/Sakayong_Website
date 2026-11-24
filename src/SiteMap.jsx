import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import { Expand, House, Minus, Plus, Shrink } from 'lucide-react'
import { STATUS } from './readings.js'

const BASEMAP =
  'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}'
const HOME_ZOOM = 15
const MAX_ZOOM = 18
const LEGEND = ['critical', 'warning', 'watch', 'ok', 'notread']

export function SiteMap({ site, status, layers, full, onFull }) {
  const canvas = useRef(null)
  const map = useRef(null)
  const [picked, setPicked] = useState(null)
  const layer = layers.find(({ label }) => label === picked)
  const { name, lat, lon } = site
  const fullLabel = full ? 'Close full map' : 'Open full map'

  useEffect(() => {
    const at = [lat, lon]
    const m = L.map(canvas.current, { center: at, zoom: HOME_ZOOM, zoomControl: false, attributionControl: false })
    map.current = m

    // Esri serves this basemap down to zoom 16; deeper zooms enlarge those tiles.
    L.tileLayer(BASEMAP, { maxNativeZoom: 16, maxZoom: MAX_ZOOM }).addTo(m)

    const ring = { color: '#fff', fill: false, interactive: false }
    L.circle(at, { ...ring, radius: 500, weight: 1, opacity: 0.4 }).addTo(m)
    L.circle(at, { ...ring, radius: 100, weight: 1.5, opacity: 0.7 }).addTo(m)

    const label = document.createElement('span')
    label.textContent = name
    const icon = L.divIcon({ className: 'pin', html: label, iconSize: [18, 18] })
    L.marker(at, { icon, interactive: false, keyboard: false }).addTo(m)

    const resize = new ResizeObserver(() => m.invalidateSize())
    resize.observe(canvas.current)
    return () => {
      resize.disconnect()
      m.remove()
    }
  }, [name, lat, lon])

  useEffect(() => {
    if (!layer?.tiles) return
    const overlay = L.tileLayer(layer.tiles, { opacity: 0.65, maxZoom: MAX_ZOOM }).addTo(map.current)
    return () => overlay.remove()
  }, [layer?.tiles, name, lat, lon])

  useEffect(() => {
    if (!full) return
    const closeOnEscape = (event) => event.key === 'Escape' && onFull(false)
    addEventListener('keydown', closeOnEscape)
    return () => removeEventListener('keydown', closeOnEscape)
  }, [full, onFull])

  return (
    <section className={full ? 'map full' : 'map'} data-status={status} aria-label={`Map of ${name}`}>
      <div className="map-canvas" ref={canvas} />

      <div className="map-top">
        <div className="layers">
          {layers.map(({ label }) => (
            <button
              key={label}
              className="button"
              aria-pressed={label === picked}
              onClick={() => setPicked(label === picked ? null : label)}
            >
              {label}
            </button>
          ))}
          {layer && !layer.tiles && (
            <p className="map-note" role="status">
              No data yet for “{layer.label}”
            </p>
          )}
        </div>

        <div className="controls">
          <button className="button" aria-label={fullLabel} onClick={() => onFull(!full)}>
            {full ? <Shrink size={16} /> : <Expand size={16} />}
            <span>{fullLabel}</span>
          </button>
          <button className="button icon" aria-label="Zoom in" onClick={() => map.current.zoomIn()}>
            <Plus size={16} />
          </button>
          <button className="button icon" aria-label="Zoom out" onClick={() => map.current.zoomOut()}>
            <Minus size={16} />
          </button>
          <button
            className="button icon"
            aria-label={`Back to ${name}`}
            onClick={() => map.current.setView([lat, lon], HOME_ZOOM)}
          >
            <House size={16} />
          </button>
        </div>
      </div>

      <div className="map-bottom">
        <ul className="legend">
          {LEGEND.map((key) => (
            <li key={key} data-status={key}>
              <i className="dot" />
              {STATUS[key]}
            </li>
          ))}
          <li className="circles">
            <i className="ring" />
            The reading's circles: 100 m and 500 m
          </li>
        </ul>
        <p className="credit">Basemap © Esri, HERE, Garmin, OpenStreetMap &amp; the GIS user community</p>
      </div>
    </section>
  )
}
