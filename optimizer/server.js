const express = require('express')
const cors = require('cors')

const app = express()
app.use(cors({ origin: true, credentials: true }))
app.use(express.json({ limit: '5mb' }))

app.get('/optimizer/health', (_req, res) => res.send('ok'))

app.post('/optimizer/plan', (req, res) => {
  const { depot, orders = [] } = req.body || {}
  const result = {
    ok: true,
    depot,
    route: orders.map(o => o.id || o).slice(0, 10) // stub
  }
  res.json(result)
})

const PORT = process.env.PORT || 8790
app.listen(PORT, () => console.log('Optimizer läuft auf', PORT))
