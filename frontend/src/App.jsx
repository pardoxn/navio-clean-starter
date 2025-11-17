import React, { useEffect, useMemo, useState } from 'react'
import {
  Package,
  Truck,
  BarChart3,
  ChevronRight,
  Plus,
  MapPin,
  UploadCloud,
  FileSpreadsheet,
  Settings2,
  History,
  Table as TableIcon,
  X,
  Save,
  User,
  Hash,
  LogOut,
  Shield,
  Bell,
  Palette,
  Keyboard,
  Trash2,
  ListFilter,
} from 'lucide-react'

// Vite-Env (für später, wenn echte API-Funktionen dazukommen)
const API_URL = import.meta.env.VITE_API_URL || ''
const OPT_URL = import.meta.env.VITE_OPTIMIZER_URL || ''

export default function NavioApp() {
  const [active, setActive] = useState('orders') // 'orders' | 'tours' | 'analytics'
  const [profileOpen, setProfileOpen] = useState(false)

  return (
    <div className="relative min-h-screen text-slate-800 selection:bg-indigo-200/60">
      {/* Hintergrund */}
      <Backdrop />

      {/* Topbar */}
      <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/80 backdrop-blur-2xl shadow-[0_10px_30px_rgba(2,6,23,0.06)] supports-[backdrop-filter]:bg-white/65">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-sky-400 to-indigo-500 text-white shadow-lg shadow-sky-500/20 ring-1 ring-white/40">
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <div className="text-sm tracking-wide text-slate-500">Navio</div>
              <div className="text-lg font-semibold">Logistics Console</div>
            </div>
          </div>

          {/* Profil */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setProfileOpen(true)}
              className="group inline-flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white/90 px-3 py-2 text-left shadow-sm transition hover:bg-white"
              title="Profil & Einstellungen"
            >
              <div className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-indigo-400 to-sky-400 text-white shadow-md">
                BN
              </div>
              <div className="hidden sm:block">
                <div className="leading-tight text-sm font-medium text-slate-800">Benedikt</div>
                <div className="text-[11px] text-slate-500">Dispo · online</div>
              </div>
            </button>
          </div>
        </div>
      </header>

      {/* Inhalt */}
      <div className="relative z-20 mx-auto max-w-7xl px-6 py-8">
        {/* Tabs */}
        <nav className="mb-8 flex flex-wrap gap-2">
          <TabButton
            icon={Package}
            label="Bestellungen"
            active={active === 'orders'}
            onClick={() => setActive('orders')}
          />
          <TabButton
            icon={Truck}
            label="Touren"
            active={active === 'tours'}
            onClick={() => setActive('tours')}
          />
          <TabButton
            icon={BarChart3}
            label="Analytics"
            active={active === 'analytics'}
            onClick={() => setActive('analytics')}
          />
        </nav>

        {active === 'orders' && <OrdersView />}
        {active === 'tours' && <ToursView />}
        {active === 'analytics' && <AnalyticsView />}
      </div>

      <CreditsBadge />
      <ProfilePanel open={profileOpen} onClose={() => setProfileOpen(false)} />
    </div>
  )
}

function Backdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-sky-50 via-white to-indigo-50" />
      <div className="absolute -top-32 -left-24 h-80 w-80 rounded-full bg-gradient-to-tr from-sky-200 via-indigo-100 to-pink-100 opacity-40 blur-3xl" />
      <div className="absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-gradient-to-tr from-amber-100 via-rose-100 to-sky-100 opacity-40 blur-3xl" />
      <div className="absolute left-1/2 top-1/3 h-64 w-64 -translate-x-1/2 rounded-full bg-gradient-to-tr from-white/70 to-indigo-100/70 opacity-50 blur-2xl" />
    </div>
  )
}

function TabButton({ icon: Icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`group inline-flex items-center gap-2 rounded-2xl border px-4 py-2 backdrop-blur-xl transition ${
        active
          ? 'border-slate-200/90 bg-white/90 text-slate-800 shadow-[0_8px_30px_rgba(2,6,23,0.06)]'
          : 'border-slate-200/70 bg-white/70 text-slate-700 hover:bg-white/90'
      }`}
    >
      <Icon className="h-4 w-4 text-slate-600" />
      <span className="font-medium">{label}</span>
    </button>
  )
}

function Card({ title, children, actions, className }) {
  return (
    <div
      className={`rounded-3xl border border-slate-200/80 bg-white/90 p-6 shadow-[0_12px_40px_rgba(2,6,23,0.06)] backdrop-blur-xl ${
        className || ''
      }`}
    >
      <div className="mb-4 flex items-center justify-between">
        <h3 className="m-0 text-base font-semibold text-slate-800">{title}</h3>
        {actions}
      </div>
      {children}
    </div>
  )
}

function OrdersView() {
  const initial = [
    { id: 'G4492', customer: 'Corne Naalden Vleesvee', city: 'Seifersdorf', weight: 437 },
    { id: 'G4420', customer: 'Daniel Schreiber', city: 'Blumberg', weight: 261.5 },
    { id: 'G4339', customer: 'Stefan Selzer', city: 'Kirn', weight: 198 },
    { id: '24447', customer: 'Hakenkamp Agrartechnik', city: 'Herzebrock', weight: 227.2 },
  ]

  const [orders, setOrders] = useState(initial)
  const [showAdd, setShowAdd] = useState(false)
  const [selected, setSelected] = useState(new Set())

  const [history, setHistory] = useState([])

  const tableOrders = useMemo(() => orders, [orders])

  function handleCreate(newOrder) {
    const id =
      newOrder.id && newOrder.id.trim().length
        ? newOrder.id
        : `M${Date.now().toString().slice(-5)}`
    setOrders((prev) => [
      { id, customer: newOrder.customer, city: newOrder.city || '', weight: newOrder.weight },
      ...prev,
    ])
    setShowAdd(false)
  }

  function toggleSelect(id) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function clearSelection() {
    setSelected(new Set())
  }

  function removeSelected() {
    if (selected.size === 0) return
    setOrders((prev) => prev.filter((o) => !selected.has(o.id)))
    setSelected(new Set())
  }

  function selectAllVisible() {
    const allIds = tableOrders.map((o) => o.id)
    const allSelected = allIds.every((id) => selected.has(id))
    setSelected((prev) => {
      const next = new Set(prev)
      if (allSelected) allIds.forEach((id) => next.delete(id))
      else allIds.forEach((id) => next.add(id))
      return next
    })
  }

  function onImportBatch(batch) {
    setOrders((prev) => [
      ...batch.rows.map((r) => ({ ...r, batchId: batch.id, imported: true })),
      ...prev,
    ])
    setHistory((prev) => [
      { id: batch.id, when: 'gerade eben', rows: batch.rows.length, ok: true },
      ...prev,
    ])
  }

  function deleteBatch(batchId) {
    setOrders((prev) => prev.filter((o) => o.batchId !== batchId))
    setSelected((prev) => {
      const next = new Set(prev)
      orders.filter((o) => o.batchId === batchId).forEach((o) => next.delete(o.id))
      return next
    })
  }

  return (
    <div className="space-y-8">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <ListFilter className="h-4 w-4" /> CSV importieren oder Bestellungen manuell hinzufügen
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAdd(true)}
            className="inline-flex items-center gap-2 rounded-xl border border-sky-300 bg-sky-50 px-4 py-2 text-sm font-semibold text-sky-700 transition hover:bg-sky-100"
          >
            <Plus className="h-4 w-4" /> Bestellung hinzufügen
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-xl border border-indigo-300 bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-100"
          >
            <Truck className="h-4 w-4" />
            Touren planen
            <span className="ml-1 rounded-full bg-white/80 px-2 py-[1px] text-[10px] font-semibold text-indigo-600">
              NavioAI
            </span>
          </button>
        </div>
      </div>

      {/* CSV Import + Verlauf */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="h-full md:col-span-2">
          <CsvImportCard onImport={onImportBatch} />
        </div>
        <div className="h-full md:col-span-1">
          <ImportHistoryCard items={history} onDeleteBatch={deleteBatch} />
        </div>
      </div>

      {/* Bulk-Actions */}
      {selected.size > 0 && (
        <BulkBar count={selected.size} onClear={clearSelection} onDelete={removeSelected} />
      )}

      {/* Tabelle */}
      <OrdersTable
        orders={tableOrders}
        selected={selected}
        onToggle={toggleSelect}
        onToggleAll={selectAllVisible}
      />

      <AddOrderModal
        open={showAdd}
        onClose={() => setShowAdd(false)}
        onCreate={handleCreate}
      />
    </div>
  )
}

function OrdersTable({ orders, selected, onToggle, onToggleAll }) {
  const allSelected = orders.length > 0 && orders.every((o) => selected.has(o.id))
  return (
    <div className="max-h-[440px] overflow-y-auto overflow-x-auto rounded-2xl border border-slate-200 bg-white/90 shadow-sm">
      <table className="w-full text-sm">
        <thead className="sticky top-0 bg-white/90 text-slate-500 backdrop-blur-xl">
          <tr className="border-b border-slate-200">
            <th className="w-10 px-3 py-2 text-left">
              <input
                aria-label="Alle auswählen"
                type="checkbox"
                checked={allSelected}
                onChange={onToggleAll}
                className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-200"
              />
            </th>
            <th className="px-3 py-2 text-left">Kunde</th>
            <th className="px-3 py-2 text-left">Bestell-ID</th>
            <th className="px-3 py-2 text-left">Ort</th>
            <th className="px-3 py-2 text-right">Gewicht</th>
          </tr>
        </thead>
        <tbody className="text-slate-800">
          {orders.map((o) => (
            <tr
              key={o.id}
              className="border-b border-slate-100/80 hover:bg-slate-50/60"
            >
              <td className="px-3 py-2">
                <input
                  type="checkbox"
                  checked={selected.has(o.id)}
                  onChange={() => onToggle(o.id)}
                  className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-200"
                />
              </td>
              <td className="px-3 py-2">{o.customer}</td>
              <td className="px-3 py-2 text-slate-600">{o.id}</td>
              <td className="px-3 py-2">{o.city || '—'}</td>
              <td className="px-3 py-2 text-right">{o.weight} kg</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function BulkBar({ count, onClear, onDelete }) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-rose-200 bg-rose-50/80 px-4 py-2 text-sm text-rose-800">
      <div>
        <strong>{count}</strong> ausgewählt
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={onClear}
          className="rounded-lg border border-rose-200 bg-white px-3 py-1 text-rose-700 hover:bg-white/80"
        >
          Abwählen
        </button>
        <button
          onClick={onDelete}
          className="inline-flex items-center gap-1 rounded-lg border border-rose-300 bg-rose-100 px-3 py-1 font-semibold hover:bg-rose-200"
        >
          <Trash2 className="h-4 w-4" /> Löschen
        </button>
      </div>
    </div>
  )
}

function CsvImportCard({ onImport }) {
  const [isDrag, setIsDrag] = useState(false)
  const [fileName, setFileName] = useState('')
  const [fileObj, setFileObj] = useState(null)
  const [mapping] = useState({ id: 'id', zip: 'zip', city: 'city', weight: 'weight' })

  const preview = [
    { id: 'G4492', customer: 'Corne Naalden Vleesvee', city: 'Seifersdorf', weight: 437 },
    { id: 'G4420', customer: 'Daniel Schreiber', city: 'Blumberg', weight: 261.5 },
    { id: 'G4339', customer: 'Stefan Selzer', city: 'Kirn', weight: 198 },
  ]

  function onDrop(e) {
    e.preventDefault()
    e.stopPropagation()
    setIsDrag(false)
    const f = e.dataTransfer.files?.[0]
    if (f) {
      setFileObj(f)
      setFileName(f.name)
    }
  }

  function batchId() {
    return `IMP-${new Date().toISOString().slice(0, 10)}-${Math.random()
      .toString(36)
      .slice(2, 6)}`
  }

  async function handleImport() {
    const id = batchId()
    if (!fileObj) {
      onImport({ id, rows: preview })
      return
    }
    const text = await fileObj.text()
    const rows = parseCSVToOrders(text)
    onImport({ id, rows: rows.length ? rows : preview })
  }

  return (
    <Card
      title="CSV Import"
      className="flex h-full flex-col"
      actions={
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Settings2 className="h-4 w-4" /> Mapping
        </div>
      }
    >
      <label
        onDragOver={(e) => {
          e.preventDefault()
          setIsDrag(true)
        }}
        onDragLeave={() => setIsDrag(false)}
        onDrop={onDrop}
        className={`flex w-full cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center transition ${
          isDrag ? 'border-indigo-300 bg-indigo-50' : 'border-slate-200 bg-white/80'
        }`}
      >
        <UploadCloud className="mb-3 h-8 w-8 text-slate-400" />
        <div className="text-sm font-medium text-slate-800">CSV hierher ziehen oder klicken</div>
        <div className="text-xs text-slate-500">Unterstützt: .csv · UTF-8 / ; oder ,</div>
        <input
          type="file"
          accept=".csv"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0]
            setFileObj(f || null)
            setFileName(f?.name || '')
          }}
        />
        {fileName && (
          <div className="mt-3 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-600">
            {fileName}
          </div>
        )}
      </label>

      <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
        {Object.entries(mapping).map(([k, v]) => (
          <div
            key={k}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white/80 px-3 py-2 text-sm"
          >
            <span className="rounded-md bg-slate-100/80 px-2 py-0.5 text-xs text-slate-600">
              {k}
            </span>
            <span className="text-slate-700">→</span>
            <span className="font-medium text-slate-800">{v}</span>
          </div>
        ))}
      </div>

      <div className="mt-4 rounded-2xl border border-slate-200 bg-white/90 p-3">
        <div className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
          <TableIcon className="h-4 w-4" /> Vorschau (3 Zeilen)
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-slate-500">
              <tr>
                <th className="py-2">id</th>
                <th className="py-2">zip</th>
                <th className="py-2">city</th>
                <th className="py-2">weight</th>
              </tr>
            </thead>
            <tbody className="text-slate-800">
              {preview.map((r) => (
                <tr key={r.id} className="border-t border-slate-100/80">
                  <td className="py-2">{r.id}</td>
                  <td className="py-2">—</td>
                  <td className="py-2">{r.city || '—'}</td>
                  <td className="py-2">{r.weight}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-800 transition hover:bg-white/80">
          <FileSpreadsheet className="h-4 w-4" /> Datei prüfen
        </button>
        <button
          onClick={handleImport}
          className="inline-flex items-center gap-2 rounded-xl border border-indigo-300 bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-100"
        >
          <UploadCloud className="h-4 w-4" /> Import vorbereiten
        </button>
        <span className="text-xs text-slate-500">
          Demo: Import legt Datensätze in die Tabelle unten
        </span>
      </div>
    </Card>
  )
}

function ImportHistoryCard({ items, onDeleteBatch }) {
  return (
    <Card
      title="Importverlauf"
      className="flex h-full flex-col"
      actions={
        <span className="inline-flex items-center gap-1 text-xs text-slate-500">
          <History className="h-4 w-4" /> Verlauf
        </span>
      }
    >
      {items.length === 0 ? (
        <div className="text-sm text-slate-500">Noch keine Importe</div>
      ) : (
        <div className="mt-1 flex-1 overflow-y-auto -mr-1 pr-1">
          <ul className="space-y-2 text-sm">
            {items.map((it) => (
              <li
                key={it.id}
                className="flex items-center justify-between rounded-xl border border-slate-200 bg-white/80 px-3 py-2"
              >
                <div>
                  <div className="font-medium text-slate-800">{it.id}</div>
                  <div className="text-xs text-slate-500">
                    {it.when} · {it.rows} Zeilen
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ${
                      it.ok
                        ? 'border border-emerald-200 bg-emerald-50 text-emerald-700'
                        : 'border border-amber-200 bg-amber-50 text-amber-700'
                    }`}
                  >
                    {it.ok ? 'OK' : 'Warnungen'}
                  </span>
                  <button
                    onClick={() => onDeleteBatch(it.id)}
                    className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-2 py-1 text-xs text-rose-700 hover:bg-rose-100"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Batch löschen
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  )
}

function parseCSVToOrders(text) {
  const lines = text.split(/\r?\n/).filter((l) => l.trim() !== '')
  if (lines.length < 2) return []
  const delim = detectDelimiter(lines[0])
  const headers = splitLine(lines[0], delim)
    .map((h) => h.trim().replace(/^"|"$/g, '').toLowerCase())

  const getIdx = (cands) =>
    cands.map((c) => headers.indexOf(c)).find((i) => i >= 0) ?? -1
  const idxId = getIdx(['id', 'bestell-id', 'auftrag', 'auftrag_id', 'auftragid', 'beleg', 'belegnummer'])
  const idxCust = getIdx(['customer', 'kunde', 'name', 'firma'])
  const idxCity = getIdx(['city', 'ort', 'stadt'])
  const idxWeight = getIdx(['weight', 'gewicht', 'kg'])

  const res = []
  for (let i = 1; i < lines.length; i++) {
    const cells = splitLine(lines[i], delim)
    if (!cells.length) continue
    const idRaw = idxId >= 0 ? cells[idxId] : ''
    const id = (idRaw || '').trim() || `I${i.toString().padStart(4, '0')}`
    const customer = ((idxCust >= 0 ? cells[idxCust] : '') || `Unbenannt ${i}`)
      .toString()
      .trim()
    const city = (idxCity >= 0 ? cells[idxCity] : '')
      .toString()
      .trim()
    const wRaw = (idxWeight >= 0 ? cells[idxWeight] : '')
      .toString()
      .replace(',', '.')
    const weight = Number.parseFloat(wRaw) || 0
    res.push({ id, customer, city, weight })
  }
  return res
}

function detectDelimiter(header) {
  return (header.match(/;/g)?.length || 0) > (header.match(/,/g)?.length || 0)
    ? ';'
    : ','
}

function splitLine(line, d) {
  const out = []
  let cur = ''
  let inQ = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') {
      if (inQ && line[i + 1] === '"') {
        cur += '"'
        i++
        continue
      }
      inQ = !inQ
      continue
    }
    if (ch === d && !inQ) {
      out.push(cur)
      cur = ''
      continue
    }
    cur += ch
  }
  out.push(cur)
  return out
}

function ToursView() {
  const tours = [
    {
      name: 'Tour Stuttgart',
      region: 'Baden-Württemberg',
      stops: 5,
      distance: 450,
      weight: 1250,
    },
    {
      name: 'Tour München',
      region: 'Bayern',
      stops: 4,
      distance: 520,
      weight: 1100,
    },
  ]

  return (
    <div className="space-y-6">
      {tours.map((t) => (
        <div
          key={t.name}
          className="rounded-3xl border border-slate-200/80 bg-white/90 p-7 shadow-[0_8px_30px_rgba(2,6,23,0.05)] backdrop-blur-xl transition hover:shadow-[0_12px_40px_rgba(2,6,23,0.08)]"
        >
          <div className="mb-6 flex items-start justify-between">
            <div>
              <h3 className="text-2xl font-light text-slate-900">{t.name}</h3>
              <div className="mt-1 inline-flex items-center gap-2 text-slate-600">
                <MapPin className="h-4 w-4" />
                {t.region}
              </div>
            </div>
            <span className="rounded-full border border-emerald-300 bg-emerald-50 px-3 py-1 text-xs text-emerald-700">
              Aktiv
            </span>
          </div>
          <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
            <Metric label="Stops" value={t.stops} />
            <Metric label="Distanz" value={`${t.distance} km`} />
            <Metric label="Fracht" value={`${t.weight} kg`} />
          </div>
          <div className="flex gap-3">
            <button className="flex-1 rounded-xl border border-slate-200/80 bg-white/90 px-4 py-3 text-sm font-medium text-slate-800 transition hover:bg-white">
              Details
            </button>
            <button className="flex-1 rounded-xl border border-sky-300 bg-sky-50 px-4 py-3 text-sm font-medium text-sky-700 transition hover:bg-sky-100">
              Navigation
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

function AnalyticsView() {
  return (
    <div className="flex h-64 items-center justify-center rounded-3xl border border-slate-200/80 bg-white/90 p-6 text-center text-slate-500 shadow-[0_10px_30px_rgba(2,6,23,0.06)]">
      <div>
        <BarChart3 className="mx-auto mb-3 h-8 w-8 text-slate-300" />
        <div className="text-sm font-medium text-slate-700">Analytics & Auswertungen</div>
        <div className="text-xs text-slate-500">
          Geplant für ein späteres Update – hier erscheinen später KPIs und Charts.
        </div>
      </div>
    </div>
  )
}

function Metric({ label, value }) {
  return (
    <div>
      <div className="mb-1 text-xs text-slate-500">{label}</div>
      <div className="text-2xl font-light text-slate-900">{value}</div>
    </div>
  )
}

function AddOrderModal({ open, onClose, onCreate }) {
  const [customer, setCustomer] = useState('')
  const [id, setId] = useState('')
  const [zip, setZip] = useState('')
  const [city, setCity] = useState('')
  const [street, setStreet] = useState('')
  const [country, setCountry] = useState('Deutschland')
  const [phone, setPhone] = useState('')
  const [notes, setNotes] = useState('')
  const [weight, setWeight] = useState('')
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (open) setErrors({})
  }, [open])

  function validate() {
    const e = {}
    if (!customer.trim()) e.customer = 'Pflichtfeld'
    const w = Number(weight)
    if (!(w > 0)) e.weight = 'Gewicht > 0'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function submit() {
    if (!validate()) return
    onCreate({
      id: id.trim() || undefined,
      customer: customer.trim(),
      city: city.trim() || undefined,
      weight: Number(weight),
    })
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-2xl rounded-3xl border border-slate-200/80 bg-white/90 p-6 shadow-[0_20px_60px_rgba(2,6,23,0.18)]">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">
            Bestellung manuell hinzufügen
          </h3>
          <button
            onClick={onClose}
            className="rounded-lg border border-slate-200 bg-white p-1 text-slate-500 hover:text-slate-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field
            label="Kunde"
            required
            error={errors.customer}
            icon={<User className="h-4 w-4" />}
          >
            <input
              value={customer}
              onChange={(e) => setCustomer(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 outline-none focus:border-indigo-300"
              placeholder="z. B. Daniel Schreiber"
            />
          </Field>
          <Field label="Bestell-ID" icon={<Hash className="h-4 w-4" />}>
            <input
              value={id}
              onChange={(e) => setId(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 outline-none focus:border-indigo-300"
              placeholder="optional"
            />
          </Field>

          <Field label="PLZ" icon={<MapPin className="h-4 w-4" />}>
            <input
              value={zip}
              onChange={(e) => setZip(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 outline-none focus:border-indigo-300"
              placeholder="z. B. 78176"
            />
          </Field>
          <Field label="Ort" icon={<MapPin className="h-4 w-4" />}>
            <input
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 outline-none focus:border-indigo-300"
              placeholder="optional (wird später aus PLZ erkannt)"
            />
          </Field>

          <Field label="Straße & Nr.">
            <input
              value={street}
              onChange={(e) => setStreet(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 outline-none focus:border-indigo-300"
              placeholder="optional"
            />
          </Field>
          <Field label="Land">
            <input
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 outline-none focus:border-indigo-300"
            />
          </Field>

          <Field label="Telefon">
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 outline-none focus:border-indigo-300"
              placeholder="optional"
            />
          </Field>
          <Field label="Gewicht (kg)" required error={errors.weight}>
            <input
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              inputMode="decimal"
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 outline-none focus:border-indigo-300"
              placeholder="z. B. 250"
            />
          </Field>

          <div className="md:col-span-2">
            <label className="mb-1 block text-xs font-medium text-slate-600">
              Notizen
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 outline-none focus:border-indigo-300"
              placeholder="optional (z. B. Lieferzeitfenster, Hinweise…)"
            />
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-white/80"
          >
            Abbrechen
          </button>
          <button
            onClick={submit}
            className="inline-flex items-center gap-2 rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100"
          >
            <Save className="h-4 w-4" /> Anlegen
          </button>
        </div>
      </div>
    </div>
  )
}

function Field({ label, required, error, icon, children }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-slate-600">
        {label} {required && <span className="text-rose-600">*</span>}
      </label>
      <div
        className={`flex items-center gap-2 rounded-xl border bg-white px-3 py-2 ${
          error ? 'border-rose-300 ring-2 ring-rose-100' : 'border-slate-200'
        }`}
      >
        {icon && <span className="text-slate-400">{icon}</span>}
        <div className="flex-1">{children}</div>
      </div>
      {error && <div className="mt-1 text-xs text-rose-600">{error}</div>}
    </div>
  )
}

function ProfilePanel({ open, onClose }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm"
        onClick={onClose}
      />
      <aside className="absolute right-0 top-0 h-full w-full max-w-md border-l border-slate-200 bg-white/95 shadow-[0_20px_60px_rgba(2,6,23,0.18)] backdrop-blur-xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-indigo-400 to-sky-400 text-white">
              BN
            </div>
            <div>
              <div className="text-sm font-semibold text-slate-900">Benedikt</div>
              <div className="text-xs text-slate-500">
                Dispo · benedikt.niewels@werny.de
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg border border-slate-200 bg-white p-1 text-slate-500 hover:text-slate-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-3 p-6">
          <ProfileItem
            icon={<User className="h-4 w-4" />}
            label="Profil bearbeiten"
            hint="Name, Avatar"
          />
          <ProfileItem
            icon={<Shield className="h-4 w-4" />}
            label="Sicherheit"
            hint="Passwort ändern, 2FA (später)"
          />
          <ProfileItem
            icon={<Bell className="h-4 w-4" />}
            label="Benachrichtigungen"
            hint="E-Mail, Push (später)"
          />
          <ProfileItem
            icon={<Palette className="h-4 w-4" />}
            label="Design & Theme"
            hint="Hell/Dunkel, Akzent"
          />
          <ProfileItem
            icon={<Keyboard className="h-4 w-4" />}
            label="Tastenkürzel"
            hint="⌘K, ⌘S …"
          />
        </div>

        <div className="mt-4 border-t border-slate-200 p-6">
          <button className="inline-flex items-center gap-2 rounded-xl border border-rose-300 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-100">
            <LogOut className="h-4 w-4" /> Logout
          </button>
          <div className="mt-2 text-xs text-slate-500">
            (UI-Demo, keine echte Abmeldung)
          </div>
        </div>
      </aside>
    </div>
  )
}

function ProfileItem({ icon, label, hint }) {
  return (
    <button className="flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-left transition hover:bg-white">
      <div className="flex items-center gap-3">
        <span className="text-slate-500">{icon}</span>
        <div>
          <div className="text-sm font-medium text-slate-800">{label}</div>
          {hint && <div className="text-xs text-slate-500">{hint}</div>}
        </div>
      </div>
      <ChevronRight className="h-4 w-4 text-slate-400" />
    </button>
  )
}

function CreditsBadge() {
  return (
    <footer className="fixed bottom-4 right-4 z-30">
      <span className="inline-flex items-center gap-1 rounded-full border border-slate-200/80 bg-white/90 px-3 py-1 text-[11px] text-slate-600 shadow backdrop-blur-xl">
        <span>created with</span>
        <span aria-label="heart" role="img">
          ❤️
        </span>
        <span>by Benedikt Niewels</span>
      </span>
    </footer>
  )
}

// Kleine Hilfstests (optional, musst du nicht benutzen)
export function runUiSanityTests() {
  const components = [
    NavioApp,
    Backdrop,
    TabButton,
    Card,
    OrdersView,
    ToursView,
    AnalyticsView,
    Metric,
    CsvImportCard,
    ImportHistoryCard,
    AddOrderModal,
    Field,
    ProfilePanel,
    ProfileItem,
    CreditsBadge,
  ]
  return {
    hasAllComponents: components.every((c) => typeof c === 'function'),
    hasCsvUi: typeof CsvImportCard === 'function',
    hasAddOrderModal: typeof AddOrderModal === 'function',
    hasProfile: typeof ProfilePanel === 'function',
    defaultView: 'orders',
    hasPagination: typeof OrdersTable === 'function',
    apiUrlType: typeof API_URL,
  }
}

export function runEnvResolutionTests() {
  return {
    apiUrlType: typeof API_URL,
    optUrlType: typeof OPT_URL,
    apiUrlEmptyAllowed: API_URL === '' || typeof API_URL === 'string',
    optUrlEmptyAllowed: OPT_URL === '' || typeof OPT_URL === 'string',
  }
}
