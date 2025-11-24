// optimizer/server.js
const express = require('express')
const cors = require('cors')
const { planToursWithGeo } = require('./ai')

const app = express()
app.use(cors())
app.use(express.json())

// Depot / Konstanten
const DEPOT = {
  name: 'Depot Bad Wünnenberg',
  street: 'Ostring 3',
  zip: '33181',
  city: 'Bad Wünnenberg',
}

const DEPOT_ZIP = DEPOT.zip
const MAX_TOUR_KG = 1200

// Hilfsfunktionen
function normalizeOrders(rawOrders) {
  if (!Array.isArray(rawOrders)) return []

  return rawOrders
    .map((o, idx) => {
      const weightNum = Number(
        String(o.weight ?? o.gewicht ?? '0').replace(',', '.')
      )

      const zipRaw = o.zip || o.plz || o.postcode || ''
      const zip = String(zipRaw).trim()

      return {
        id: o.id || o.belegnummer || `LS-${String(idx + 1).padStart(4, '0')}`,
        customerName: o.customerName || o.kunde || o.matchcode || `Unbenannt ${idx + 1}`,
        customerNumber: o.customerNumber || o.kundennr || '',
        zip,
        city: o.city || o.ort || '',
        deliveryDate: o.deliveryDate || o.lieferscheindatum || '',
        weight: Number.isFinite(weightNum) ? weightNum : 0,
      }
    })
    .filter((o) => o.zip && o.weight > 0)
}

function parseGermanDate(dateStr = '') {
  if (!dateStr) return null
  const trimmed = String(dateStr).trim()
  const match = trimmed.match(/^(\d{1,2})\.(\d{1,2})\.(\d{2,4})$/)
  if (match) {
    const [, d, m, yRaw] = match
    const year = yRaw.length === 2 ? `20${yRaw}` : yRaw
    const iso = `${year.padStart(4, '0')}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`
    const parsed = new Date(iso)
    if (!Number.isNaN(parsed.getTime())) return parsed
  }
  const generic = new Date(trimmed)
  if (!Number.isNaN(generic.getTime())) return generic
  return null
}

function normalizeDeliverySlot(value) {
  const parsed = parseGermanDate(value)
  if (!parsed) {
    return {
      slot: 'flex',
      label: 'Flexible Lieferung',
      priority: 9999,
    }
  }
  const iso = parsed.toISOString().slice(0, 10)
  return {
    slot: iso,
    label: parsed.toLocaleDateString('de-DE'),
    priority: parsed.getTime(),
  }
}

// API-Endpunkt
app.post('/optimize', (req, res) => {
  try {
    const rawOrders = req.body?.orders || []
    const cleaned = normalizeOrders(rawOrders)

    if (!cleaned.length) {
      return res.json({
        depot: DEPOT,
        tours: [],
        meta: {
          reason: 'no_orders_after_normalization',
          maxTourKg: MAX_TOUR_KG,
          depotZip: DEPOT_ZIP,
          strategy: 'navio_ai_geo_sweep',
          autoPlannedAt: new Date().toISOString(),
        },
      })
    }

    const prepared = cleaned.map((order) => ({
      ...order,
      slot: normalizeDeliverySlot(order.deliveryDate),
    }))

    const aiResult = planToursWithGeo({
      orders: prepared,
      depot: DEPOT,
      capacityKg: MAX_TOUR_KG,
    })

    const response = {
      depot: DEPOT,
      tours: aiResult.tours,
      meta: {
        maxTourKg: MAX_TOUR_KG,
        depotZip: DEPOT_ZIP,
        ordersInput: cleaned.length,
        toursPlanned: aiResult.tours.length,
        slotGroups: aiResult.stats.slotGroups,
        strategy: aiResult.stats.planner,
        ordersWithGeo: aiResult.stats.ordersWithGeo,
        ordersMissingGeo: aiResult.stats.ordersMissingGeo,
        autoPlannedAt: new Date().toISOString(),
      },
    }

    res.json(response)
  } catch (err) {
    console.error('Optimizer error:', err)
    res.status(500).json({ error: 'optimizer_failed', message: String(err) })
  }
})

// Start Server
const PORT = process.env.PORT || 8790
app.listen(PORT, () => {
  console.log(`Navio Optimizer läuft auf http://localhost:${PORT}`)
})
