export interface Aircraft {
  icao24: string
  callsign: string
  origin_country: string
  longitude: number
  latitude: number
  altitude: number
  velocity: number
  on_ground: boolean
  time: number
}

const OPENSKY_API = '/opensky/api/states/all'
const OPENSKY_TOKEN = '/openskyauth/auth/realms/opensky-network/protocol/openid-connect/token'
const ADSB_API = '/adsb/v2/point'
const ADSB_CENTERS = [
  { lat: 40, lon: -100, radius: 1500 },
  { lat: -15, lon: -60, radius: 1500 },
  { lat: 50, lon: 10, radius: 1500 },
  { lat: 5, lon: 20, radius: 1500 },
  { lat: 30, lon: 100, radius: 1500 },
  { lat: -25, lon: 135, radius: 1500 },
]

let tokenCache: { token: string; expiry: number } | null = null

async function getOpenSkyToken(
  clientId: string,
  clientSecret: string
): Promise<string | null> {
  if (tokenCache && tokenCache.expiry > Date.now() + 60000) return tokenCache.token
  try {
    const body = new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: clientId,
      client_secret: clientSecret,
    })
    const res = await fetch(OPENSKY_TOKEN, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    })
    if (!res.ok) return null
    const data = await res.json()
    const token: string | undefined = data.access_token
    if (!token) return null
    tokenCache = {
      token,
      expiry: Date.now() + (data.expires_in ?? 3600) * 1000,
    }
    return token
  } catch {
    return null
  }
}

const mapOpenSky = (s: any, responseTime: number): Aircraft => ({
  icao24: s[0],
  callsign: s[1] || 'UNKNOWN',
  origin_country: s[2],
  longitude: s[5],
  latitude: s[6],
  altitude: s[7] ?? s[13] ?? 0,
  velocity: s[9] ?? 0,
  on_ground: s[8],
  time: s[3] ?? s[4] ?? responseTime,
})

const mapAdsb = (a: any): Aircraft => ({
  icao24: a.hex,
  callsign: (a.flight || '').trim() || 'UNKNOWN',
  origin_country: '',
  longitude: a.lon,
  latitude: a.lat,
  altitude: a.alt_baro ?? 0,
  velocity: a.gs ?? 0,
  on_ground: false,
  time: Date.now() / 1000,
})

export const fetchAircraftStates = async (): Promise<Aircraft[]> => {
  const clientId = import.meta.env.VITE_OPENSKY_CLIENT_ID as string | undefined
  const clientSecret = import.meta.env.VITE_OPENSKY_CLIENT_SECRET as string | undefined

  try {
    const headers: Record<string, string> = {}
    if (clientId && clientSecret) {
      const token = await getOpenSkyToken(clientId, clientSecret)
      if (token) headers['Authorization'] = `Bearer ${token}`
    }
    const res = await fetch(OPENSKY_API, { headers })
    if (res.ok) {
      const data = await res.json()
      const list = (data.states || [])
        .map((s: any) => mapOpenSky(s, data.time))
        .filter((a: Aircraft) => a.latitude != null && a.longitude != null)
      if (list.length) return list
    }
  } catch (err) {
    console.error('OpenSky failed, falling back to adsb.lol:', err)
  }

  try {
    const results = await Promise.allSettled(
      ADSB_CENTERS.map((c) =>
        fetch(`${ADSB_API}/${c.lat}/${c.lon}/${c.radius}`).then((r) =>
          r.ok ? r.json() : null
        )
      )
    )
    const seen = new Set<string>()
    const out: Aircraft[] = []
    for (const r of results) {
      if (r.status !== 'fulfilled' || !r.value?.ac) continue
      for (const a of r.value.ac) {
        if (a.lat == null || a.lon == null) continue
        if (seen.has(a.hex)) continue
        seen.add(a.hex)
        out.push(mapAdsb(a))
      }
    }
    return out
  } catch (err) {
    console.error('adsb.lol failed:', err)
    return []
  }
}

export interface Satellite {
  sat_id: number
  sat_name: string
  int_des: string
  launch_date: string
  longitude: number
  latitude: number
  altitude: number
}

const N2YO_API_KEY = import.meta.env.VITE_N2YO_API_KEY || ''

export const fetchSatellites = async (longitude: number, latitude: number): Promise<Satellite[]> => {
  try {
    const response = await fetch(
      `https://api.n2yo.com/rest/v1/satellite/above?lat=${latitude}&lon=${longitude}&alt=0&cat=0&limit=100&apiKey=${N2YO_API_KEY}`
    )
    if (!response.ok) return []
    const data = await response.json()
    return data.above || []
  } catch (error) {
    console.error('Error fetching satellites:', error)
    return []
  }
}