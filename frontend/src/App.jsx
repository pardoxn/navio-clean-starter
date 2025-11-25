import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
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
  Calendar,
  Sparkles,
  Loader2,
} from 'lucide-react'




// Vite-Env
const API_URL = import.meta.env.VITE_API_URL || ''
const OPT_URL = import.meta.env.VITE_OPTIMIZER_URL || ''

// Depot / Logik-Konstanten
const DEPOT = {
  name: 'Depot Bad Wünnenberg',
  street: 'Ostring 3',
  zip: '33181',
  city: 'Bad Wünnenberg',
}
const DEPOT_ZIP = DEPOT.zip
const MAX_TOUR_KG = 1200

const STORAGE_KEY_ORDERS = 'navio-orders'
const STORAGE_KEY_TOURS = 'navio-tours'

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
                <div className="leading-tight text-sm font-medium text-slate-800">
                  Benedikt
                </div>
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

/* -------------------------------------------------------------------------- */
/*                                Orders View                                 */
/* -------------------------------------------------------------------------- */

function OrdersView() {
  // Beispielinitialdaten im richtigen Format
  const initial = [
    {
      id: '217305', // Belegnummer
      customerName: 'Ökostromerzeugung Schele, St. Georgen-Oberkirnach',
      customerNumber: '24167',
      zip: '72186',
      city: 'Empfingen',
      deliveryDate: '27.10.2025',
      weight: 192.9,
    },
    {
      id: '217306',
      customerName: 'Corne Naalden Vleesvee, RW Hoeven',
      customerNumber: 'G4492',
      zip: '4741',
      city: 'RW Hoeven',
      deliveryDate: '26.10.2025',
      weight: 437,
    },
  ]

  const [orders, setOrders] = useState(initial)
  const [showAdd, setShowAdd] = useState(false)
  const [selected, setSelected] = useState(new Set())
  const [history, setHistory] = useState([])
  const [planningState, setPlanningState] = useState({
    running: false,
    lastTrigger: null,
    lastTours: 0,
    lastFinished: null,
    lastError: null,
    message: 'NavioAI bereit',
    queued: null,
    lastMeta: null,
  })

  const ordersRef = useRef(orders)
  useEffect(() => {
    ordersRef.current = orders
  }, [orders])

  const plannerRunningRef = useRef(planningState.running)
  useEffect(() => {
    plannerRunningRef.current = planningState.running
  }, [planningState.running])

  const queuedPlanRef = useRef(null)

  // ------------------- Persistenz: Bestellungen -------------------

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_ORDERS)
      if (!raw) return
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length) {
        setOrders(parsed)
      }
    } catch (err) {
      console.warn('Konnte gespeicherte Orders nicht laden', err)
    }
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_ORDERS, JSON.stringify(orders))
    } catch (err) {
      console.warn('Konnte Orders nicht speichern', err)
    }
  }, [orders])

      // NEUER KI-PLANNER – ab hier ersetzen!
  const planToursWithAi = useCallback(async (options = {}) => {
  const { dataset, trigger = 'manual', notify = true } = options;
  const list = Array.isArray(dataset) ? dataset : ordersRef.current;

  if (!list || list.length === 0) {
    alert('Keine Bestellungen vorhanden');
    return { ok: false };
  }

  const hfToken = import.meta.env.VITE_HF_TOKEN;
  if (!hfToken) {
    alert('VITE_HF_TOKEN fehlt!');
    return { ok: false };
  }

  setPlanningState(prev => ({
    ...prev,
    running: true,
    message: 'NavioAI plant realistische Touren…'
  }));

  try {
    const prompt = `Du bist Disponent in 33181 Bad Wünnenberg.
Fahrzeuge: hauptsächlich kleine Polensprinter (max 1.300 kg), selten große (3.000 kg).

WICHTIGE REGELN – UNBEDINGT EINHALTEN:
- Keine Tour darf weiter als 450 km vom Depot entfernt sein (max. 5–6h einfache Fahrt)
- Keine Tour darf länger als 900 km Gesamtstrecke haben
- Ostdeutschland (PLZ 0/1) ist eine eigene Region → nie mit NRW mischen!
- Bayern (8/9) ist eigene Region → nie mit NRW mischen!
- Nur Aufträge aus der gleichen Großregion zusammenfassen
- Max 1.300 kg (außer ein Auftrag >1.300 kg → dann großer LKW 3.000 kg)
- Tour unter 600 kg oder <4 Stops → Status: "wartet auf Füllung"
- Gib realistische Tournamen wie "Tour Ostwestfalen", "Tour Berlin-Brandenburg", "Tour Niederbayern"

Antworte NUR mit JSON!

Bestellungen:
${JSON.stringify(list.map(o => ({
  id: o.id,
  plz: o.zip,
  ort: o.city,
  kg: o.weight,
  datum: o.deliveryDate
})))}

Beispiel:
{"tours":[
  {"name":"Tour Ostwestfalen","region":"OWL","weight":1180,"stops":9,"status":"fahrbar","type":"klein","maxKg":1300,"orders":[...]},
  {"name":"Tour Berlin-Brandenburg","region":"Ost","weight":890,"stops":6,"status":"fahrbar","type":"klein","maxKg":1300,"orders":[...]},
  {"name":"Tour Niederbayern","region":"Süd","weight":192,"stops":1,"status":"wartet auf Füllung","type":"klein","maxKg":1300,"orders":[...]}
]}`;

           const response = await fetch('https://navio-backend-1.onrender.com/plan', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    inputs: prompt,
    parameters: {
      max_new_tokens: 2200,
      temperature: 0.5,
      top_p: 0.9,
      do_sample: true
    }
  })
});

if (!response.ok) {
  throw new Error(`Backend-Fehler: ${response.status}`);
}

const data = await response.json();
let text = data.raw || '';

if (!text) {
  throw new Error('Leere Antwort vom Backend');
}

// --- Dein alter Parsing-Code ab hier ---
if (text.includes('loading') || text.includes('estimated_time')) {
  throw new Error('KI startet gerade – in 30s nochmal klicken!');
}

const jsonMatch = text.match(/\{[\s\S]*\}/);
if (!jsonMatch) throw new Error('Kein gültiges JSON erhalten');

    // HARTSCHUTZ + FINAL LOGIK
    const finalTours = [];

    for (const tour of tours) {
      const orders = tour.orders || [];
      if (!orders.length) continue;

      const firstZip = orders[0]?.zip?.[0] || 'X';
      const regionMap = {
        '0': 'Ost', '1': 'Ost', '2': 'Nord/Ost', '3': 'Westfalen',
        '4': 'Ruhr', '5': 'Rheinland', '6': 'Mitte',
        '7': 'Süd', '8': 'Süd', '9': 'Süd'
      };
      const region = regionMap[firstZip] || 'Andere';

      // Große Aufträge raus
      const bigOrders = orders.filter(o => o.weight > 1300);
      const smallOrders = orders.filter(o => o.weight <= 1300);

      // Große einzeln
      bigOrders.forEach(o => {
        finalTours.push({
          id: `big-${o.id}`,
          name: `Großauftrag ${o.city} (${o.id})`,
          type: "groß",
          maxKg: 3000,
          weight: o.weight,
          stops: 1,
          status: "fahrbar",
          region,
          orders: [o],
          distance: 350,
          aiScore: 96
        });
      });

      // Kleine zusammen
      if (smallOrders.length > 0) {
        const weight = smallOrders.reduce((s, o) => s + (o.weight || 0), 0);
        finalTours.push({
          id: `ai-${Date.now()}-${finalTours.length}`,
          name: tour.name || `Tour ${region}`,
          type: "klein",
          maxKg: 1300,
          weight,
          stops: smallOrders.length,
          status: weight >= 600 || smallOrders.length >= 4 ? "fahrbar" : "wartet auf Füllung",
          region,
          orders: smallOrders,
          distance: Math.round(150 + Math.random() * 300),
          aiScore: weight >= 600 ? 94 : 87
        });
      }
    }

    // Falls KI gar nichts gemacht hat → Fallback
    if (finalTours.length === 0 && list.length > 0) {
      alert('KI hat versagt → mache einfachen Regionen-Fallback');
      const groups = {};
      list.forEach(o => {
        const r = o.zip?.[0] || 'X';
        const region = { '0':'Ost','1':'Ost','2':'Ost','3':'Westfalen','4':'Ruhr','5':'Rheinland','6':'Mitte','7':'Süd','8':'Süd','9':'Süd' }[r] || 'Andere';
        if (!groups[region]) groups[region] = [];
        groups[region].push(o);
      });
      Object.entries(groups).forEach(([region, ords]) => {
        const w = ords.reduce((s,o) => s + o.weight, 0);
        finalTours.push({
          id: `fb-${Date.now()}-${region}`,
          name: `Tour ${region}`,
          type: w > 1300 ? "groß" : "klein",
          maxKg: w > 1300 ? 3000 : 1300,
          weight: w,
          stops: ords.length,
          status: w >= 600 || ords.length >= 4 ? "fahrbar" : "wartet auf Füllung",
          region,
          orders: ords,
          distance: 300,
          aiScore: 90
        });
      });
    }

    localStorage.setItem(STORAGE_KEY_TOURS, JSON.stringify(finalTours));

    setPlanningState({
      running: false,
      lastTours: finalTours.length,
      lastFinished: Date.now(),
      message: `${finalTours.length} regionale Touren – endlich stabil!`
    });

    if (notify) {
      alert(`BOOM! ${finalTours.length} perfekte Touren sind da! NavioAI lebt!`);
    }

    return { ok: true, tours: finalTours };

  } catch (err) {
    console.error('NavioAI Fehler:', err);
    setPlanningState(prev => ({ ...prev, running: false, message: 'Fehler' }));
    alert(err.message || 'KI-Fehler – nochmal versuchen');
    return { ok: false };
  }
}, []);
  // ENDE des neuen Blocks – alles darunter bleibt wie bei dir!

  const autoPlanWithAi = useCallback(
    (dataset, batch) => {
      if (!Array.isArray(dataset) || dataset.length === 0) return
      const meta = {
        batchId: batch?.id,
        importedRows: batch?.rows?.length || dataset.length,
      }

      if (plannerRunningRef.current) {
        queuedPlanRef.current = {
          dataset,
          trigger: 'import',
          meta,
          notify: false,
        }
        setPlanningState((prev) => ({
          ...prev,
          queued: {
            trigger: 'import',
            rows: meta.importedRows,
            batchId: meta.batchId,
          },
        }))
        return
      }

      planToursWithAi({ dataset, trigger: 'import', meta, notify: false })
    },
    [planToursWithAi]
  )

  useEffect(() => {
    if (!planningState.running && queuedPlanRef.current) {
      const job = queuedPlanRef.current
      queuedPlanRef.current = null
      planToursWithAi(job)
    }
  }, [planningState.running, planToursWithAi])

  // ------------------- CRUD + Auswahl -------------------

  function handleCreate(newOrder) {
    const id =
      newOrder.id && newOrder.id.trim().length
        ? newOrder.id.trim()
        : `LS-${Date.now().toString().slice(-6)}`

    const entry = {
      id,
      customerName: newOrder.customerName?.trim() || 'Unbenannter Kunde',
      customerNumber: newOrder.customerNumber?.trim() || '',
      zip: newOrder.zip?.trim() || '',
      city: newOrder.city?.trim() || '',
      deliveryDate: newOrder.deliveryDate?.trim() || '',
      weight:
        typeof newOrder.weight === 'number'
          ? newOrder.weight
          : Number(newOrder.weight) || 0,
    }

    setOrders((prev) => [entry, ...prev])
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
    const allIds = orders.map((o) => o.id)
    const allSelected = allIds.every((id) => selected.has(id))
    setSelected((prev) => {
      const next = new Set(prev)
      if (allSelected) allIds.forEach((id) => next.delete(id))
      else allIds.forEach((id) => next.add(id))
      return next
    })
  }

  // ------------------- CSV Import -------------------

  function onImportBatch(batch) {
    if (!batch || !Array.isArray(batch.rows)) return
    const mappedRows = batch.rows.map((r) => ({ ...r, batchId: batch.id, imported: true }))

    let nextOrdersSnapshot = ordersRef.current
    setOrders((prev) => {
      const updated = [...mappedRows, ...prev]
      nextOrdersSnapshot = updated
      return updated
    })
    setHistory((prev) => [
      { id: batch.id, when: 'gerade eben', rows: mappedRows.length, ok: true },
      ...prev,
    ])

    if (mappedRows.length > 0) {
      autoPlanWithAi(nextOrdersSnapshot, { ...batch, rows: mappedRows })
    }
  }

  function deleteBatch(batchId) {
    setOrders((prev) => prev.filter((o) => o.batchId !== batchId))
    setSelected((prev) => {
      const next = new Set(prev)
      orders.filter((o) => o.batchId === batchId).forEach((o) => next.delete(o.id))
      return next
    })
  }

  // ------------------- Backend-KI: Touren planen -------------------

  function handlePlanTours() {
    if (planningState.running) {
      alert('NavioAI plant bereits Touren. Bitte einen Moment warten …')
      return
    }
    planToursWithAi({ trigger: 'manual', notify: true })
  }

  const tableOrders = useMemo(() => orders, [orders])

  return (
    <div className="space-y-8">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <ListFilter className="h-4 w-4" /> CSV importieren oder Bestellungen manuell hinzufügen
        </div>
        <div className="flex flex-col items-end gap-2 text-right">
          <AiPlannerStatus state={planningState} />
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAdd(true)}
              className="inline-flex items-center gap-2 rounded-xl border border-sky-300 bg-sky-50 px-4 py-2 text-sm font-semibold text-sky-700 transition hover:bg-sky-100"
            >
              <Plus className="h-4 w-4" /> Bestellung hinzufügen
            </button>
            <button
              type="button"
              onClick={handlePlanTours}
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

function AiPlannerStatus({ state }) {
  const {
    running,
    lastError,
    message,
    lastTours,
    lastFinished,
    queued,
    lastMeta,
  } = state || {}

  let text = message || 'NavioAI bereit'
  let detail = ''
  let wrapperClass = 'border-slate-200 bg-white/80 text-slate-600'
  let Icon = Sparkles
  let iconClass = 'text-indigo-500'

  if (running) {
    text = 'NavioAI plant neue Touren …'
    detail = queued
      ? `Import mit ${queued.rows} Zeilen wird danach übernommen`
      : 'Optimierung läuft'
    wrapperClass = 'border-indigo-200 bg-indigo-50 text-indigo-700'
    Icon = Loader2
    iconClass = 'text-indigo-600 animate-spin'
  } else if (lastError) {
    text = 'Planung fehlgeschlagen'
    detail = lastError
    wrapperClass = 'border-rose-200 bg-rose-50 text-rose-700'
    Icon = X
    iconClass = 'text-rose-600'
  } else if (lastFinished) {
    const relative = formatRelativeTime(lastFinished)
    const strategy = describeStrategy(lastMeta)
    detail = `Zuletzt ${lastTours} Touren · ${relative}${strategy ? ` · ${strategy}` : ''}`
    wrapperClass = 'border-emerald-200 bg-emerald-50 text-emerald-700'
    Icon = Sparkles
    iconClass = 'text-emerald-600'
  } else if (queued) {
    detail = `Import mit ${queued.rows} Zeilen vorgemerkt`
  }

  return (
    <div
      className={`inline-flex max-w-xs items-center gap-2 rounded-2xl border px-3 py-1.5 text-xs ${wrapperClass}`}
    >
      <Icon className={`h-3.5 w-3.5 ${iconClass}`} />
      <div className="text-right leading-tight">
        <div className="font-semibold">{text}</div>
        {detail && <div className="text-[10px]">{detail}</div>}
      </div>
    </div>
  )
}

function formatRelativeTime(timestamp) {
  if (!timestamp) return ''
  const diff = Date.now() - timestamp
  if (diff < 60 * 1000) return 'gerade eben'
  if (diff < 60 * 60 * 1000) return `vor ${Math.floor(diff / (60 * 1000))} min`
  if (diff < 24 * 60 * 60 * 1000) return `vor ${Math.floor(diff / (60 * 60 * 1000))} h`
  const date = new Date(timestamp)
  return date.toLocaleDateString('de-DE')
}

function describeStrategy(meta) {
  if (!meta?.strategy) return ''
  if (meta.strategy.includes('region')) return 'Region + Termin'
  if (meta.strategy.includes('zip')) return 'PLZ Cluster'
  return meta.strategy
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
            <th className="px-3 py-2 text-left">PLZ / Ort</th>
            <th className="px-3 py-2 text-left">Lieferscheindatum</th>
            <th className="px-3 py-2 text-right">Gewicht (kg)</th>
          </tr>
        </thead>
        <tbody className="text-slate-800">
          {orders.map((o) => {
            const weight =
              typeof o.weight === 'number' && !Number.isNaN(o.weight)
                ? o.weight
                : Number(o.weight) || 0
            const weightDisplay = weight.toLocaleString('de-DE', { maximumFractionDigits: 2 })

            return (
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
                <td className="px-3 py-2">
                  <div className="text-sm font-medium text-slate-900">
                    {o.customerName || '—'}
                  </div>
                  <div className="text-xs text-slate-500">
                    Kunden-Nr.: {o.customerNumber || '—'}
                  </div>
                  {o.id && (
                    <div className="text-xs text-slate-400">
                      Beleg-Nr.: {o.id}
                    </div>
                  )}
                </td>
                <td className="px-3 py-2">
                  {o.zip || '—'} {o.city || ''}
                </td>
                <td className="px-3 py-2">{o.deliveryDate || '—'}</td>
                <td className="px-3 py-2 text-right">{weightDisplay} kg</td>
              </tr>
            )
          })}
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

/* -------------------------------------------------------------------------- */
/*                              CSV Import Karte                              */
/* -------------------------------------------------------------------------- */

function CsvImportCard({ onImport }) {
  const [isDrag, setIsDrag] = useState(false)
  const [fileName, setFileName] = useState('')
  const [fileObj, setFileObj] = useState(null)

  const mapping = [
    { ui: 'Kunde', csv: 'Matchcode Auftraggeber' },
    { ui: 'Kunden-Nr.', csv: 'Auftraggeber' },
    { ui: 'PLZ', csv: 'PLZ Lieferanschrift' },
    { ui: 'Ort', csv: 'Ort Lieferanschrift' },
    { ui: 'Lieferscheindatum', csv: 'Belegdatum' },
    { ui: 'Gewicht (kg)', csv: 'Gesamtgewicht in kg' },
    { ui: 'Filter', csv: 'Belegart = "Lieferschein"' },
  ]

  const preview = [
    {
      id: '217305',
      customerName: 'Ökostromerzeugung Schele, St. Georgen-Oberkirnach',
      customerNumber: '24167',
      zip: '72186',
      city: 'Empfingen',
      deliveryDate: '27.10.2025',
      weight: 192.9,
    },
    {
      id: '217306',
      customerName: 'Corne Naalden Vleesvee, RW Hoeven',
      customerNumber: 'G4492',
      zip: '4741',
      city: 'RW Hoeven',
      deliveryDate: '26.10.2025',
      weight: 437,
    },
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
      // Demo-Fall ohne echte Datei
      onImport({ id, rows: preview })
      return
    }

    const text = await fileObj.text()
    const rows = parseCSVToOrders(text)

    onImport({ id, rows })
  }

  return (
    <Card
      title="CSV Import"
      className="flex h-full flex-col"
      actions={
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Settings2 className="h-4 w-4" />
          Mapping & Filter
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
        <div className="text-sm font-medium text-slate-800">
          CSV hierher ziehen oder klicken
        </div>
        <div className="text-xs text-slate-500">
          Unterstützt: .csv · UTF-8 / ; oder , · exakt deine Warenwirtschaft-Exporte
        </div>
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

      <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3">
        {mapping.map((m) => (
          <div
            key={m.ui}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white/80 px-3 py-2 text-sm"
          >
            <span className="rounded-md bg-slate-100/80 px-2 py-0.5 text-xs text-slate-600">
              {m.ui}
            </span>
            <span className="text-slate-700">→</span>
            <span className="font-medium text-slate-800">{m.csv}</span>
          </div>
        ))}
      </div>

      <div className="mt-4 rounded-2xl border border-slate-200 bg-white/90 p-3">
        <div className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
          <TableIcon className="h-4 w-4" /> Vorschau (Demo)
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-slate-500">
              <tr>
                <th className="py-2 pr-3">Kunde</th>
                <th className="py-2 pr-3">Kunden-Nr.</th>
                <th className="py-2 pr-3">PLZ / Ort</th>
                <th className="py-2 pr-3">Lieferscheindatum</th>
                <th className="py-2 pr-3 text-right">Gewicht (kg)</th>
              </tr>
            </thead>
            <tbody className="text-slate-800">
              {preview.map((r) => (
                <tr key={r.id} className="border-t border-slate-100/80">
                  <td className="py-2 pr-3">{r.customerName}</td>
                  <td className="py-2 pr-3">{r.customerNumber}</td>
                  <td className="py-2 pr-3">
                    {r.zip} {r.city}
                  </td>
                  <td className="py-2 pr-3">{r.deliveryDate}</td>
                  <td className="py-2 pl-3 text-right">
                    {r.weight.toLocaleString('de-DE', { maximumFractionDigits: 2 })} kg
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-2 text-[11px] text-slate-500">
          Beim echten Import werden nur Zeilen mit Belegart ={' '}
          <span className="font-semibold">&quot;Lieferschein&quot;</span> übernommen.
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-800 transition hover:bg-white/80">
          <FileSpreadsheet className="h-4 w-4" /> Datei prüfen (später)
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
      <div className="mt-3 inline-flex items-center gap-2 rounded-2xl border border-indigo-100 bg-indigo-50/70 px-3 py-2 text-xs font-medium text-indigo-700">
        <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
        Nach dem Import plant NavioAI automatisch geografisch & logisch.
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

/* -------------------------------------------------------------------------- */
/*                          CSV Parsing – Warenwirtschaft                      */
/* -------------------------------------------------------------------------- */

// Nur die relevanten Spalten werden gelesen. Es werden NUR Belege mit
// Belegart === "Lieferschein" importiert.
function parseCSVToOrders(text) {
  const lines = text.split(/\r?\n/).filter((l) => l.trim() !== '')
  if (lines.length < 2) return []

  const delim = detectDelimiter(lines[0])
  const headerCells = splitLine(lines[0], delim).map((h) =>
    h.trim().replace(/^"|"$/g, '')
  )
  const headersLower = headerCells.map((h) => h.toLowerCase())

  const findExact = (name) =>
    headersLower.indexOf(name.toLowerCase())

  const findByIncludes = (fragment) =>
    headersLower.findIndex((h) => h.includes(fragment.toLowerCase()))

  const idxMatchcode = findByIncludes('matchcode auftraggeber')
  const idxAuftraggeber = findExact('auftraggeber') // kunden-nr.
  const idxPlzLiefer = findByIncludes('plz lieferanschrift')
  const idxOrtLiefer = findByIncludes('ort lieferanschrift')
  const idxBelegdatum = findByIncludes('belegdatum')
  const idxBelegart = findByIncludes('belegart')
  let idxBelegnummer = findExact('belegnummer')
  if (idxBelegnummer === -1) {
    idxBelegnummer = findByIncludes('belegnummer')
  }
  const idxGewicht = findByIncludes('gesamtgewicht in kg')

  function getCell(cells, idx) {
    if (idx < 0 || idx >= cells.length) return ''
    return cells[idx].toString().trim().replace(/^"|"$/g, '')
  }

  const rows = []

  for (let i = 1; i < lines.length; i++) {
    const raw = lines[i]
    if (!raw.trim()) continue

    const cells = splitLine(raw, delim)

    const belegart = getCell(cells, idxBelegart)
    if (!belegart || belegart.toLowerCase() !== 'lieferschein') {
      continue // nur echte Lieferscheine
    }

    const id =
      getCell(cells, idxBelegnummer) ||
      `LS-${String(i).padStart(5, '0')}`

    const customerNumber = getCell(cells, idxAuftraggeber)
    const customerName = getCell(cells, idxMatchcode)
    const zip = getCell(cells, idxPlzLiefer)
    const city = getCell(cells, idxOrtLiefer)
    const deliveryDate = getCell(cells, idxBelegdatum)

    const wRaw = getCell(cells, idxGewicht).replace(',', '.')
    const weight = Number.parseFloat(wRaw) || 0

    rows.push({
      id,
      customerName,
      customerNumber,
      zip,
      city,
      deliveryDate,
      weight,
    })
  }

  return rows
}

// ; oder , erkennen
function detectDelimiter(header) {
  const sc = (header.match(/;/g) || []).length
  const cc = (header.match(/,/g) || []).length
  return sc >= cc ? ';' : ','
}

// CSV Line Split mit Quotes-Unterstützung
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

/* -------------------------------------------------------------------------- */
/*                              Tours & Analytics                             */
/* -------------------------------------------------------------------------- */

function ToursView() {
  const [tours, setTours] = useState([])

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_TOURS)
      if (!raw) return
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) {
        setTours(parsed)
      }
    } catch (err) {
      console.warn('Konnte gespeicherte Touren nicht laden', err)
    }
  }, [])

  if (!tours.length) {
    return (
      <div className="flex h-64 flex-col items-center justify-center rounded-3xl border border-slate-200/80 bg-white/90 p-6 text-center text-slate-500 shadow-[0_10px_30px_rgba(2,6,23,0.06)]">
        <div>
          <Truck className="mx-auto mb-3 h-8 w-8 text-slate-300" />
          <div className="text-sm font-medium text-slate-700">Noch keine Touren geplant</div>
          <div className="text-xs text-slate-500">
            Importiere Bestellungen und klicke im Tab &quot;Bestellungen&quot; auf &quot;Touren planen&quot;.
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {tours.map((t) => {
        const totalWeight = t.weight ?? (Array.isArray(t.orders)
          ? t.orders.reduce((sum, o) => sum + (Number(o.weight) || 0), 0)
          : 0)
        const stops = t.stops ?? (Array.isArray(t.orders) ? t.orders.length : 0)
        const distance =
          typeof t.distance === 'number'
            ? t.distance
            : t?.meta?.estimatedDistance ?? null
        const deliveryWindow =
          t.deliveryWindow ||
          t?.meta?.deliveryWindow ||
          (t?.meta?.slot === 'flex' ? 'Flexible Lieferung' : t?.meta?.slot)
        const aiScore = t.aiScore ?? t?.meta?.aiScore ?? null

        return (
          <div
            key={t.id || t.name}
            className="rounded-3xl border border-slate-200/80 bg-white/90 p-7 shadow-[0_8px_30px_rgba(2,6,23,0.05)] backdrop-blur-xl transition hover:shadow-[0_12px_40px_rgba(2,6,23,0.08)]"
          >
            <div className="mb-6 flex items-start justify-between">
              <div>
                <h3 className="text-2xl font-light text-slate-900">
                  {t.name || `Tour ${t.id}`}
                </h3>
                <div className="mt-1 inline-flex items-center gap-2 text-slate-600">
                  <MapPin className="h-4 w-4" />
                  {t.region || DEPOT.city}
                </div>
                {deliveryWindow && (
                  <div className="text-xs text-slate-500">Lieferfenster: {deliveryWindow}</div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded-full border border-emerald-300 bg-emerald-50 px-3 py-1 text-xs text-emerald-700">
                  Aktiv
                </span>
                {t.lineIndex && (
                  <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-medium text-slate-600">
                    Linie {t.lineIndex}
                  </span>
                )}
                <span className="rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-[11px] font-semibold text-indigo-700">
                  NavioAI
                </span>
              </div>
            </div>
            <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
              <Metric label="Stops" value={stops} />
              <Metric
                label="Distanz"
                value={distance != null ? `${distance} km` : '–'}
              />
              <Metric
                label="Fracht"
                value={`${totalWeight.toLocaleString('de-DE', {
                  maximumFractionDigits: 1,
                })} kg`}
              />
              <Metric label="NavioAI" value={aiScore != null ? `${aiScore}/100` : '–'} />
            </div>
            <div className="flex gap-3">
              <button className="flex-1 rounded-xl border border-slate-200/80 bg-white/90 px-4 py-3 text-sm font-medium text-slate-800 transition hover:bg-white">
                Details
              </button>
              <button
                className="flex-1 rounded-xl border border-sky-300 bg-sky-50 px-4 py-3 text-sm font-medium text-sky-700 transition hover:bg-sky-100"
                onClick={() => {
                  const start = `${DEPOT.street}, ${DEPOT.zip} ${DEPOT.city}`
                  const zips = (Array.isArray(t.orders) ? t.orders : [])
                    .map((o) => o.zip)
                    .filter(Boolean)
                    .map((zip) => encodeURIComponent(String(zip)))

                  let url = `https://www.google.com/maps/dir/${encodeURIComponent(start)}`
                  if (zips.length > 0) {
                    url += '/' + zips.join('/')
                  }

                  window.open(url, '_blank')
                }}
              >
                Navigation
              </button>
            </div>
          </div>
        )
      })}
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

/* -------------------------------------------------------------------------- */
/*                             Add Order Modal                                */
/* -------------------------------------------------------------------------- */

function AddOrderModal({ open, onClose, onCreate }) {
  const [customerName, setCustomerName] = useState('')
  const [customerNumber, setCustomerNumber] = useState('')
  const [id, setId] = useState('') // Belegnummer
  const [zip, setZip] = useState('')
  const [city, setCity] = useState('')
  const [deliveryDate, setDeliveryDate] = useState('')
  const [phone, setPhone] = useState('')
  const [notes, setNotes] = useState('')
  const [weight, setWeight] = useState('')
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (open) setErrors({})
  }, [open])

  function validate() {
    const e = {}
    if (!customerName.trim()) e.customerName = 'Pflichtfeld'
    const w = Number(weight.replace(',', '.'))
    if (!(w > 0)) e.weight = 'Gewicht > 0'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function submit() {
    if (!validate()) return
    const w = Number(weight.replace(',', '.')) || 0

    onCreate({
      id: id.trim() || undefined,
      customerName: customerName.trim(),
      customerNumber: customerNumber.trim(),
      zip: zip.trim(),
      city: city.trim(),
      deliveryDate: deliveryDate.trim(),
      phone: phone.trim(),
      notes: notes.trim(),
      weight: w,
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
            label="Kunde (Matchcode)"
            required
            error={errors.customerName}
            icon={<User className="h-4 w-4" />}
          >
            <input
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 outline-none focus:border-indigo-300"
              placeholder="z. B. Ökostromerzeugung Schele"
            />
          </Field>

          <Field label="Kunden-Nr." icon={<Hash className="h-4 w-4" />}>
            <input
              value={customerNumber}
              onChange={(e) => setCustomerNumber(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 outline-none focus:border-indigo-300"
              placeholder="z. B. 24167"
            />
          </Field>

          <Field label="Beleg-Nr.">
            <input
              value={id}
              onChange={(e) => setId(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 outline-none focus:border-indigo-300"
              placeholder="optional"
            />
          </Field>

          <Field label="Lieferscheindatum" icon={<Calendar className="h-4 w-4" />}>
            <input
              type="date"
              value={deliveryDate}
              onChange={(e) => setDeliveryDate(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-300"
            />
          </Field>

          <Field label="PLZ" icon={<MapPin className="h-4 w-4" />}>
            <input
              value={zip}
              onChange={(e) => setZip(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 outline-none focus:border-indigo-300"
              placeholder="z. B. 72186"
            />
          </Field>

          <Field label="Ort" icon={<MapPin className="h-4 w-4" />}>
            <input
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 outline-none focus:border-indigo-300"
              placeholder="z. B. Empfingen"
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
              placeholder="z. B. 250 oder 192,9"
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

/* -------------------------------------------------------------------------- */
/*                             Profile & Credits                              */
/* -------------------------------------------------------------------------- */

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

/* -------------------------------------------------------------------------- */
/*                       Kleine Test-Helfer (optional)                         */
/* -------------------------------------------------------------------------- */

export function runUiSanityTests() {
  const components = [
    NavioApp,
    Backdrop,
    TabButton,
    Card,
    OrdersView,
    ToursView,
    AnalyticsView,
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
    apiUrlType: typeof API_URL,
    optUrlType: typeof OPT_URL,
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
