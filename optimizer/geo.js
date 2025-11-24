const fs = require('fs')
const path = require('path')

const DATA_FILE = path.join(__dirname, 'data', 'DE', 'zipcodes.de.json')

const FIRST_DIGIT_FALLBACK = {
  '0': { lat: 51.2, lon: 13.5 },
  '1': { lat: 52.5, lon: 13.4 },
  '2': { lat: 53.5, lon: 9.9 },
  '3': { lat: 51.0, lon: 11.5 },
  '4': { lat: 52.1, lon: 7.6 },
  '5': { lat: 50.9, lon: 7.1 },
  '6': { lat: 50.2, lon: 8.6 },
  '7': { lat: 48.8, lon: 8.4 },
  '8': { lat: 48.0, lon: 10.9 },
  '9': { lat: 49.6, lon: 11.0 },
}

let cache = null

function loadIndex() {
  if (cache) return cache

  let records = []
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf8')
    records = JSON.parse(raw)
  } catch (err) {
    console.warn('[geo] Konnte PLZ-Daten nicht laden, nutze Fallbacks.', err.message)
  }

  const exact = new Map()
  const prefix3Stats = new Map()
  const prefix2Stats = new Map()

  for (const rec of records) {
    const zipcode = (rec.zipcode || rec.plz || '').trim()
    const lat = Number.parseFloat(rec.latitude || rec.lat)
    const lon = Number.parseFloat(rec.longitude || rec.lng)
    if (!zipcode || Number.isNaN(lat) || Number.isNaN(lon)) continue

    if (!exact.has(zipcode)) {
      exact.set(zipcode, { lat, lon, source: 'exact' })
    }
    if (zipcode.length >= 3) {
      addStat(prefix3Stats, zipcode.slice(0, 3), lat, lon)
    }
    if (zipcode.length >= 2) {
      addStat(prefix2Stats, zipcode.slice(0, 2), lat, lon)
    }
  }

  cache = {
    exact,
    prefix3: finalizeStats(prefix3Stats, 'prefix3'),
    prefix2: finalizeStats(prefix2Stats, 'prefix2'),
  }
  return cache
}

function addStat(bucket, key, lat, lon) {
  if (!bucket.has(key)) {
    bucket.set(key, { latSum: 0, lonSum: 0, count: 0 })
  }
  const entry = bucket.get(key)
  entry.latSum += lat
  entry.lonSum += lon
  entry.count += 1
}

function finalizeStats(bucket, source) {
  const result = new Map()
  for (const [key, value] of bucket.entries()) {
    if (!value.count) continue
    result.set(key, {
      lat: value.latSum / value.count,
      lon: value.lonSum / value.count,
      source,
    })
  }
  return result
}

function getCoordsForZip(zip) {
  const normalized = String(zip || '').trim()
  if (!normalized) return null

  const index = loadIndex()
  if (index.exact.has(normalized)) return index.exact.get(normalized)

  const prefix3 = normalized.slice(0, 3)
  if (prefix3 && index.prefix3.has(prefix3)) return index.prefix3.get(prefix3)

  const prefix2 = normalized.slice(0, 2)
  if (prefix2 && index.prefix2.has(prefix2)) return index.prefix2.get(prefix2)

  const fallback = fallbackForDigit(normalized[0], normalized)
  return fallback
}

function fallbackForDigit(digit, zip) {
  const base = FIRST_DIGIT_FALLBACK[digit]
  if (!base) return null
  const tail = Number.parseInt(String(zip).slice(1), 10) || 0
  const latOffset = ((tail % 7) - 3) * 0.04
  const lonOffset = (((Math.floor(tail / 7) % 7) - 3) * 0.04)
  return {
    lat: base.lat + latOffset,
    lon: base.lon + lonOffset,
    source: 'digit-fallback',
  }
}

module.exports = {
  getCoordsForZip,
}
