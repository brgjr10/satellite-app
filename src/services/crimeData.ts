export interface CrimeDataPoint {
  latitude: number
  longitude: number
  category: string
  date: string
  description: string
}

export const CRIMEOMETER_API_KEY = import.meta.env.VITE_CRIMEOMETER_API_KEY || ''

export const fetchCrimesByLocation = async (
  lat: number,
  lon: number,
  startDate: string,
  endDate: string,
  distance: number = 1000
): Promise<CrimeDataPoint[]> => {
  const url = `https://api.crimeometer.com/v2/crime-incidents?lat=${lat}&lon=${lon}&datetime_ini=${startDate}&datetime_end=${endDate}&distance=${distance}`
  
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': CRIMEOMETER_API_KEY,
    },
  })
  
  if (!response.ok) throw new Error('Failed to fetch crime data')
  const data = await response.json()
  return data.incidents || []
}

export const UK_POLICE_API_BASE = 'https://data.police.uk/api'

export const fetchUKPoliceForces = async () => {
  const response = await fetch(`${UK_POLICE_API_BASE}/forces`)
  if (!response.ok) throw new Error('Failed to fetch police forces')
  return response.json()
}

export const fetchUKCrimeByLocation = async (lat: number, lon: number) => {
  const response = await fetch(
    `${UK_POLICE_API_BASE}/crimes-street/all-crime?lat=${lat}&lng=${lon}`
  )
  if (!response.ok) throw new Error('Failed to fetch UK crime data')
  return response.json()
}