# Sakayong website

One page that shows the hazard readings at a point: the alerts, a map, and one box for each reading. Built with React and Vite.

## Run it

Needs Node 20.19+, or 22.12 and newer.

```
npm install
npm run dev
```

| Command | What it does |
| --- | --- |
| `npm test` | Checks the data file and the rules that read it |
| `npm run lint` | Checks the code |
| `npm run build` | Makes the finished site in `dist/` |

## Change the data

Everything on the page comes from [public/data.json](public/data.json). Its values are placeholders for now. The page reads the file when it opens and each time someone presses refresh, so on a live site you can replace `data.json` without building again.

| Field | What it holds |
| --- | --- |
| `site` | The point: `name`, `lat`, `lon` |
| `readAt` | The time shown after "Read live" |
| `layers` | The map's buttons. `tiles` is the address of a map tile layer, such as `https://example.com/{z}/{x}/{y}.png`, or `null` while there is no data |
| `boxes` | The reading boxes, in page order: `id`, `title`, `value`, `unit` (optional), `status`, `note` |

- `id` picks a box's icon: `flood`, `fire`, `pm25`, `rain`, `drought`, `heat`, `water` or `loan`. Any other `id` gets an information icon.
- `status` is `critical`, `warning`, `watch`, `ok`, `norule` or `notread`. The first three also show as alerts at the top, and the worst status colours the map pin.
- The page shows an error message if a status is misspelt or the coordinates are out of range.

## Before it goes live

The basemap comes from Esri's tile service. Check that Esri's terms cover your use.
