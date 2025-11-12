import React, { useState } from 'react'

const API_URL = import.meta.env.VITE_API_URL || ''
const OPT_URL = import.meta.env.VITE_OPTIMIZER_URL || ''

export default function App(){
  const [log, setLog] = useState([])

  const add = (line) => setLog(l => [line, ...l])

  async function testApi(){
    try{
      const r = await fetch(`${API_URL.replace(/\/$/, '')}/api/health`)
      add(`API /health: ${r.status} ${await r.text()}`)
    }catch(e){ add(`API error: ${e.message}`) }
  }

  async function loginDev(){
    try{
      const r = await fetch(`${API_URL.replace(/\/$/, '')}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'dev' })
      })
      const j = await r.json()
      add(`Login: ${r.status} ${JSON.stringify(j)}`)
    }catch(e){ add(`Login error: ${e.message}`) }
  }

  async function testOptimizer(){
    try{
      const r = await fetch(`${OPT_URL.replace(/\/$/, '')}/optimizer/health`)
      add(`Optimizer /health: ${r.status} ${await r.text()}`)
    }catch(e){ add(`Optimizer error: ${e.message}`) }
  }

  async function planSample(){
    try{
      const r = await fetch(`${OPT_URL.replace(/\/$/, '')}/optimizer/plan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ depot: [8.77, 51.71], orders: [{id:1,coord:[8.8,51.73]}] })
      })
      const j = await r.json()
      add(`Plan: ${r.status} ${JSON.stringify(j)}`)
    }catch(e){ add(`Plan error: ${e.message}`) }
  }

  return (
    <div style={{fontFamily:'system-ui, Arial', padding:20, maxWidth:900, margin:'0 auto'}}>
      <h1>Navio Clean Starter</h1>
      <p><b>API_URL:</b> {API_URL || <em>not set</em>}<br/>
         <b>OPTIMIZER_URL:</b> {OPT_URL || <em>not set</em>}</p>

      <div style={{display:'flex', gap:8, flexWrap:'wrap'}}>
        <button onClick={testApi}>Test API /health</button>
        <button onClick={loginDev}>Login (dev)</button>
        <button onClick={testOptimizer}>Test Optimizer /health</button>
        <button onClick={planSample}>Plan Sample</button>
      </div>

      <h3 style={{marginTop:24}}>Log</h3>
      <pre style={{background:'#f6f6f6', padding:12, borderRadius:8, minHeight:150}}>
{log.join('\n')}
      </pre>
    </div>
  )
}
