const express = require('express')
const cors = require('cors')

const app = express()
app.use(cors({ origin: true, credentials: true }))
app.use(express.json())

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

const PORT = process.env.PORT || 8787
app.listen(PORT, () => console.log('API läuft auf', PORT))
