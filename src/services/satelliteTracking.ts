import * as satellite from 'satellite.js'

export interface TleRecord {
  name: string
  noradId: number
  intDes: string
  line1: string
  line2: string
}

const CELESTRAK = '/celestrak/NORAD/elements/gp.php'

export async function fetchTLEs(opts: { group?: string; id?: number }): Promise<TleRecord[]> {
  const params = new URLSearchParams({ FORMAT: 'tle' })
  if (opts.id) params.set('CATNR', String(opts.id))
  else params.set('GROUP', opts.group ?? 'stations')
  const url = `${CELESTRAK}?${params.toString()}`

  const res = await fetch(url)
  if (!res.ok) throw new Error(`CelesTrak request failed: ${res.status}`)
  const text = await res.text()
  return parseTLE(text)
}

export async function fetchMergedTLEs(groups: string[]): Promise<TleRecord[]> {
  const results = await Promise.allSettled(groups.map((g) => fetchTLEs({ group: g })))
  const merged: TleRecord[] = []
  const seen = new Set<number>()
  for (const r of results) {
    if (r.status !== 'fulfilled') continue
    for (const rec of r.value) {
      if (!seen.has(rec.noradId)) {
        seen.add(rec.noradId)
        merged.push(rec)
      }
    }
  }
  return merged
}

export function parseTLE(text: string): TleRecord[] {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.replace(/\s+$/, ''))
    .filter((l) => l.length > 0)

  const records: TleRecord[] = []
  for (let i = 0; i < lines.length; i++) {
    const line1 = lines[i + 1]
    const line2 = lines[i + 2]
    if (!line1?.startsWith('1 ') || !line2?.startsWith('2 ')) continue
    const noradId = parseInt(line1.substring(2, 7).trim(), 10)
    const intDes = line1.substring(9, 17).trim()
    records.push({ name: lines[i].trim(), noradId, intDes, line1, line2 })
    i += 2
  }
  return records
}

export interface PropagatedSatellite {
  sat_id: number
  sat_name: string
  int_des: string
  launch_date: string
  longitude: number
  latitude: number
  altitude: number
  velocity: number
}

export function propagate(records: TleRecord[], when: Date = new Date()): PropagatedSatellite[] {
  const gmst = satellite.gstime(when)
  const out: PropagatedSatellite[] = []

  for (const rec of records) {
    let satrec
    try {
      satrec = satellite.twoline2satrec(rec.line1, rec.line2)
    } catch {
      continue
    }

    const pv = satellite.propagate(satrec, when)
    if (!pv) continue
    const position = pv.position as { x: number; y: number; z: number } | false
    const velocity = pv.velocity as { x: number; y: number; z: number } | false
    if (!position || !velocity || Number.isNaN(position.x)) continue

    const geo = satellite.eciToGeodetic(position, gmst)
    const speed = Math.sqrt(
      velocity.x * velocity.x + velocity.y * velocity.y + velocity.z * velocity.z
    )

    const year = rec.intDes.substring(0, 2)
    out.push({
      sat_id: rec.noradId,
      sat_name: rec.name,
      int_des: rec.intDes,
      launch_date: year ? `20${year}-01-01` : '',
      longitude: satellite.degreesLong(geo.longitude),
      latitude: satellite.degreesLat(geo.latitude),
      altitude: geo.height,
      velocity: speed,
    })
  }
  return out
}
