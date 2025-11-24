const express = require('express')
const cors = require('cors')
const fs = require('fs')
const path = require('path')


const app = express()
app.use(cors({ origin: true, credentials: true }))
app.use(express.json())

// --- Simple Datei-Speicher für Bestellungen (Orders) ---
const ORDERS_FILE = path.join(__dirname, 'orders.json')

function readOrders() {
  try {
    const raw = fs.readFileSync(ORDERS_FILE, 'utf8')
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed)) return parsed
    if (parsed && Array.isArray(parsed.orders)) return parsed.orders
    return []
  } catch (e) {
    // Datei existiert noch nicht oder ist leer
    return []
  }
}

function writeOrders(orders) {
  try {
    fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2), 'utf8')
  } catch (e) {
    console.error('Konnte orders.json nicht speichern:', e)
  }
}
// --- Ende Datei-Speicher ---


// simple in-memory session
if (!global.sessions) global.sessions = new Map()

function getToken(req){
  const a = req.headers.authorization
  if (a && a.startsWith('Bearer ')) return a.slice(7)
  return null
}

app.get('/api/health', (_req, res) => res.send('ok'))

app.post('/api/auth/login', (req, res) => {
  const { username = 'dev' } = req.body || {}
  const user = { id: username, name: username, role: username === 'patrick' ? 'lager' : 'dispo' }
  const token = 'token-' + Math.random().toString(36).slice(2)
  global.sessions.set(token, user)
  res.json({ ok: true, token, user })
})

app.get('/api/auth/me', (req, res) => {
  const t = getToken(req)
  const u = t ? global.sessions.get(t) : null
  if (!u) return res.status(401).json({ ok:false })
  res.json({ ok:true, user: u })
})

// --- Orders API (persistenter Speicher) ---

// Alle Bestellungen laden
app.get('/api/orders', (req, res) => {
  const orders = readOrders()
  res.json({ ok: true, orders })
})

// Vollständige Bestellliste speichern
app.post('/api/orders/save', (req, res) => {
  const body = req.body || {}
  const orders = Array.isArray(body.orders) ? body.orders : []
  writeOrders(orders)
  res.json({ ok: true, orders })
})

// --- Ende Orders API ---


const PORT = process.env.PORT || 8787
app.listen(PORT, () => console.log('API läuft auf', PORT))
