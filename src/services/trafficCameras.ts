const ROAD511_API_KEY = import.meta.env.VITE_ROAD511_API_KEY || ''

const API_BASE = 'https://api.road511.com/api/v1'

export const fetchCamerasByBbox = async (
  bbox: [number, number, number, number],
  limit: number = 100
) => {
  const [west, south, east, north] = bbox
  const url = `${API_BASE}/features?type=cameras&bbox=${west},${south},${east},${north}&limit=${limit}`
  
  const response = await fetch(url, {
    headers: {
      'X-API-Key': ROAD511_API_KEY,
    },
  })
  
  if (!response.ok) throw new Error('Failed to fetch cameras')
  return response.json()
}

export const fetchCamerasGeoJSON = async (jurisdiction: string = 'US') => {
  const url = `${API_BASE}/features/geojson?type=cameras&jurisdiction=${jurisdiction}`
  
  const response = await fetch(url, {
    headers: {
      'X-API-Key': ROAD511_API_KEY,
    },
  })
  
  if (!response.ok) throw new Error('Failed to fetch cameras geojson')
  return response.json()
}

export const fetchCameraDetails = async (cameraId: string) => {
  const url = `${API_BASE}/features/${cameraId}/details`
  
  const response = await fetch(url, {
    headers: {
      'X-API-Key': ROAD511_API_KEY,
    },
  })
  
  if (!response.ok) throw new Error('Failed to fetch camera details')
  return response.json()
}