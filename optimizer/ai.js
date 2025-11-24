const { getCoordsForZip } = require('./geo')

function planToursWithGeo({ orders, depot, capacityKg }) {
  const depotCoords =
    getCoordsForZip(depot.zip) || { lat: 51.512, lon: 8.707, source: 'depot-fallback' }

  const geoOrders = []
  const missingGeo = []

  orders.forEach((order, idx) => {
    const coords = getCoordsForZip(order.zip)
    if (!coords) {
      missingGeo.push(order)
      return
    }
    const bearing = bearingBetween(depotCoords, coords)
    const distanceFromDepot = haversineKm(depotCoords, coords)
    geoOrders.push({
      ...order,
      __nodeId: idx,
      coords,
      bearing,
      distanceFromDepot,
    })
  })

  const slotGroups = groupBySlot(geoOrders)
  const tours = []

  let tourCounter = 1
  for (const [, group] of slotGroups) {
    const built = buildToursForSlot({
      slot: group.slot,
      orders: group.orders,
      capacityKg,
      depotCoords,
      startCounter: tourCounter,
    })
    tourCounter += built.length
    tours.push(...built)
  }

  return {
    tours,
    stats: {
      planner: 'navio_ai_geo_sweep',
      slotGroups: slotGroups.size,
      ordersWithGeo: geoOrders.length,
      ordersMissingGeo: missingGeo.length,
      depotCoords,
    },
  }
}

function groupBySlot(orders) {
  const groups = new Map()
  orders.forEach((order) => {
    const slotKey = order.slot?.slot || 'flex'
    if (!groups.has(slotKey)) {
      groups.set(slotKey, { slot: order.slot, orders: [] })
    }
    groups.get(slotKey).orders.push(order)
  })
  return groups
}

function buildToursForSlot({ slot, orders, capacityKg, depotCoords, startCounter }) {
  if (!orders.length) return []
  const queue = [...orders].sort((a, b) => a.bearing - b.bearing)
  const rawRoutes = []

  while (queue.length) {
    const picked = pickOrdersForTour(queue, capacityKg)
    rawRoutes.push({ orders: picked })
  }

  balanceRoutes(rawRoutes, capacityKg)

  const formatted = rawRoutes.map((route, idx) =>
    formatRoute({
      routeOrders: route.orders,
      slot,
      capacityKg,
      depotCoords,
      tourNumber: startCounter + idx,
      sequence: idx + 1,
    })
  )

  return formatted
}

function pickOrdersForTour(queue, capacityKg) {
  const result = []
  let totalWeight = 0

  while (queue.length) {
    const candidate = queue[0]
    if (totalWeight + candidate.weight <= capacityKg) {
      result.push(queue.shift())
      totalWeight += candidate.weight
      continue
    }
    const remaining = capacityKg - totalWeight
    if (remaining <= 0) break
    const idx = queue.findIndex((order, index) => index > 0 && order.weight <= remaining)
    if (idx > 0) {
      const [picked] = queue.splice(idx, 1)
      result.push(picked)
      totalWeight += picked.weight
      continue
    }
    break
  }

  if (!result.length && queue.length) {
    result.push(queue.shift())
  }

  return result.sort((a, b) => a.bearing - b.bearing)
}

function balanceRoutes(routes, capacityKg) {
  if (routes.length < 2) return routes

  for (let i = 0; i < routes.length - 1; i++) {
    const current = routes[i]
    const next = routes[i + 1]
    let currentWeight = totalWeight(current.orders)
    let nextWeight = totalWeight(next.orders)

    const capacityLeft = capacityKg - currentWeight
    if (capacityLeft > 0 && next.orders.length > 1) {
      const candidateIdx = next.orders.findIndex(
        (order) => order.weight <= capacityLeft
      )
      if (candidateIdx >= 0) {
        const [moved] = next.orders.splice(candidateIdx, 1)
        current.orders.push(moved)
        current.orders.sort((a, b) => a.bearing - b.bearing)
        currentWeight += moved.weight
        nextWeight -= moved.weight
      }
    }

    if (
      nextWeight > 0 &&
      nextWeight < capacityKg * 0.4 &&
      currentWeight + nextWeight <= capacityKg &&
      Math.abs(meanBearing(current.orders) - meanBearing(next.orders)) <= 70
    ) {
      current.orders = current.orders.concat(next.orders)
      current.orders.sort((a, b) => a.bearing - b.bearing)
      routes.splice(i + 1, 1)
      i--
    }
  }

  return routes.filter((route) => route.orders.length)
}

function formatRoute({ routeOrders, slot, capacityKg, depotCoords, tourNumber, sequence }) {
  const slotInfo = slot || {
    slot: 'flex',
    label: 'Flexible Lieferung',
    priority: 9999,
  }
  const sanitizedOrders = routeOrders.map(stripInternalFields)
  const total = totalWeight(routeOrders)
  const direction = describeDirection(meanBearing(routeOrders))
  const deliveryWindow = slotInfo.label || 'Flexible Lieferung'
  const estimatedDistance = Math.round(estimateRouteDistance(routeOrders, depotCoords))
  const bearingSpan = computeBearingSpread(routeOrders.map((o) => o.bearing))
  const aiScore = computeAiScore({
    weight: total,
    capacityKg,
    stops: routeOrders.length,
    bearingSpan,
  })

  return {
    id: `${slotInfo.slot || 'flex'}-${tourNumber}`,
    name:
      slotInfo.slot === 'flex'
        ? `Navio Linie ${direction}`
        : `Navio Linie ${direction} · ${deliveryWindow}`,
    region: direction,
    lineIndex: sequence,
    deliveryWindow,
    orders: sanitizedOrders,
    weight: Number(total.toFixed(2)),
    stops: sanitizedOrders.length,
    distance: estimatedDistance,
    aiScore,
    zips: sanitizedOrders.map((o) => o.zip),
    meta: {
      slot: slotInfo.slot,
      slotLabel: deliveryWindow,
      slotPriority: slotInfo.priority,
      loadFactor: Number((total / capacityKg).toFixed(3)),
      direction,
      angleSpan: bearingSpan,
      estimatedDistance,
      strategy: 'navio_ai_geo_sweep',
    },
  }
}

function stripInternalFields(order) {
  const { coords, bearing, distanceFromDepot, slot, __nodeId, ...rest } = order
  return rest
}

function totalWeight(orders) {
  return orders.reduce((sum, order) => sum + (Number(order.weight) || 0), 0)
}

function meanBearing(orders) {
  if (!orders.length) return 0
  const sinSum = orders.reduce((acc, o) => acc + Math.sin((o.bearing * Math.PI) / 180), 0)
  const cosSum = orders.reduce((acc, o) => acc + Math.cos((o.bearing * Math.PI) / 180), 0)
  const angle = Math.atan2(sinSum, cosSum)
  return ((angle * 180) / Math.PI + 360) % 360
}

function computeBearingSpread(bearings) {
  if (!bearings.length) return 0
  const sorted = [...bearings].sort((a, b) => a - b)
  let maxGap = 0
  for (let i = 0; i < sorted.length - 1; i++) {
    const diff = sorted[i + 1] - sorted[i]
    if (diff > maxGap) maxGap = diff
  }
  const wrapDiff = (sorted[0] + 360) - sorted[sorted.length - 1]
  if (wrapDiff > maxGap) maxGap = wrapDiff
  return 360 - maxGap
}

function estimateRouteDistance(orders, depotCoords) {
  if (!orders.length) return 0
  let total = 0
  total += haversineKm(depotCoords, orders[0].coords)
  for (let i = 0; i < orders.length - 1; i++) {
    total += haversineKm(orders[i].coords, orders[i + 1].coords)
  }
  return total
}

function computeAiScore({ weight, capacityKg, stops, bearingSpan }) {
  const loadScore = Math.min(weight / capacityKg, 1)
  const stopScore = Math.min(stops / 8, 1)
  const geoScore = 1 - Math.min(bearingSpan / 140, 1)
  const weighted = loadScore * 0.55 + stopScore * 0.15 + geoScore * 0.3
  return Math.round(weighted * 100)
}

function describeDirection(bearing) {
  const normalized = ((bearing % 360) + 360) % 360
  const labels = [
    { name: 'Nord', min: 337.5, max: 360 },
    { name: 'Nord', min: 0, max: 22.5 },
    { name: 'Nordost', min: 22.5, max: 67.5 },
    { name: 'Ost', min: 67.5, max: 112.5 },
    { name: 'Südost', min: 112.5, max: 157.5 },
    { name: 'Süd', min: 157.5, max: 202.5 },
    { name: 'Südwest', min: 202.5, max: 247.5 },
    { name: 'West', min: 247.5, max: 292.5 },
    { name: 'Nordwest', min: 292.5, max: 337.5 },
  ]

  const hit =
    labels.find((segment) => normalized >= segment.min && normalized < segment.max) ||
    { name: 'Nord' }
  return hit.name
}

function bearingBetween(from, to) {
  const lat1 = toRadians(from.lat)
  const lat2 = toRadians(to.lat)
  const deltaLon = toRadians(to.lon - from.lon)
  const y = Math.sin(deltaLon) * Math.cos(lat2)
  const x =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(deltaLon)
  const bearing = (Math.atan2(y, x) * 180) / Math.PI
  return (bearing + 360) % 360
}

function haversineKm(a, b) {
  const R = 6371
  const dLat = toRadians(b.lat - a.lat)
  const dLon = toRadians(b.lon - a.lon)
  const lat1 = toRadians(a.lat)
  const lat2 = toRadians(b.lat)

  const sinLat = Math.sin(dLat / 2)
  const sinLon = Math.sin(dLon / 2)

  const c =
    sinLat * sinLat +
    Math.cos(lat1) * Math.cos(lat2) * sinLon * sinLon
  const d = 2 * Math.atan2(Math.sqrt(c), Math.sqrt(1 - c))

  return R * d
}

function toRadians(value) {
  return (value * Math.PI) / 180
}

module.exports = {
  planToursWithGeo,
  haversineKm,
  bearingBetween,
}
