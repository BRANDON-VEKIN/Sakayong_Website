import { useEffect, useState } from 'react'
import {
  CircleCheck,
  CloudAlert,
  CloudRain,
  CloudRainWind,
  ExternalLink,
  Eye,
  FlameKindling,
  Haze,
  Info,
  OctagonAlert,
  RefreshCw,
  SunDim,
  TestTubeDiagonal,
  Thermometer,
  TriangleAlert,
} from 'lucide-react'
import { alerts, parseReadings, STATUS, worstFirst } from './readings.js'
import { SiteMap } from './SiteMap.jsx'

const DATA_URL = `${import.meta.env.BASE_URL}data.json`

const BOX_ICONS = {
  flood: CloudRain,
  fire: FlameKindling,
  pm25: Haze,
  rain: CloudRainWind,
  drought: SunDim,
  heat: Thermometer,
  water: TestTubeDiagonal,
  loan: CloudAlert,
}

const PILL_ICONS = { critical: OctagonAlert, warning: TriangleAlert, watch: Eye, ok: CircleCheck }

function Pill({ status }) {
  const Icon = PILL_ICONS[status]
  return (
    <span className="pill" data-status={status}>
      {Icon && <Icon size={14} />}
      {STATUS[status]}
    </span>
  )
}

function Box({ box }) {
  const Icon = BOX_ICONS[box.id] ?? Info
  return (
    <article className="box" id={`box-${box.id}`} data-status={box.status}>
      <h2>
        <span className="tile">
          <Icon size={14} />
        </span>
        {box.title}
      </h2>
      <p className="value">
        <strong>{box.value}</strong>
        {box.unit && <span>{box.unit}</span>}
      </p>
      {box.status !== 'notread' && <Pill status={box.status} />}
      <p className="note">{box.note}</p>
    </article>
  )
}

async function fetchReadings() {
  const response = await fetch(DATA_URL, { cache: 'no-store' })
  if (!response.ok) throw new Error(`the server answered ${response.status}`)
  return parseReadings(await response.json())
}

export default function App() {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [reading, setReading] = useState(true)
  const [fullMap, setFullMap] = useState(false)

  const read = () =>
    fetchReadings()
      .then((fresh) => {
        setData(fresh)
        setError(null)
      })
      .catch((cause) => setError(cause.message))
      .finally(() => setReading(false))

  function readAgain() {
    setReading(true)
    read()
  }

  useEffect(() => {
    read()
  }, [])

  if (!data) {
    return (
      <main className="panel">
        <p role="status">{reading ? 'Reading…' : `The data could not be read: ${error}`}</p>
        {!reading && (
          <button className="button" onClick={readAgain}>
            Try again
          </button>
        )}
      </main>
    )
  }

  const { site, layers, boxes, readAt } = data
  const toCheck = alerts(boxes)

  let readState = `Read live · ${readAt}`
  if (error) readState = `Not refreshed: ${error}`
  if (reading) readState = 'Reading…'

  return (
    <main className="panel">
      {toCheck.length > 0 && (
        <nav className="alerts" aria-label="Readings to check" inert={fullMap}>
          {toCheck.map((box) => (
            <a key={box.id} className="chip" href={`#box-${box.id}`}>
              <Pill status={box.status} />
              {box.title}
            </a>
          ))}
        </nav>
      )}

      <div className="columns">
        <SiteMap
          site={site}
          status={worstFirst(boxes)[0]?.status}
          layers={layers}
          full={fullMap}
          onFull={setFullMap}
        />

        <div className="readings" inert={fullMap}>
          <header className="point">
            <div>
              <p className="note">The boxes read at</p>
              <h1>{site.name}</h1>
              <p className="coordinates">
                {site.lat.toFixed(5)}, {site.lon.toFixed(5)}
              </p>
            </div>
            <div className="actions">
              <p className="note" role="status">
                {readState}
              </p>
              <div>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${site.lat},${site.lon}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  Google Maps
                  <ExternalLink size={14} />
                </a>
                <button className="button icon" aria-label="Read again" onClick={readAgain}>
                  <RefreshCw size={16} />
                </button>
                <button className="button icon" aria-label="About these boxes" popoverTarget="about">
                  <Info size={16} />
                </button>
              </div>
            </div>
          </header>

          <div id="about" popover="auto">
            Each box shows the newest reading for this point. “No rule” means no limit is set for that reading, so it
            gets no status. A grey box has no reading yet.
          </div>

          <div className="boxes">
            {boxes.map((box) => (
              <Box key={box.id} box={box} />
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
