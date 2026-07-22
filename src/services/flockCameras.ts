export interface FlockCamera {
  id: string
  latitude: number
  longitude: number
  location: string
  type: 'ALPR' | 'Flock Safety'
}

// DeFlock open data sources
const DEFLOCK_DATA_SOURCES = [
  'https://raw.githubusercontent.com/deflock/deflock-data/main/cameras.json',
  'https://api.opentrafficcam.org/cameras',
]

export const fetchFlockCameras = async (
  bounds?: { north: number; south: number; east: number; west: number }
): Promise<FlockCamera[]> => {
  try {
    const response = await fetch(DEFLOCK_DATA_SOURCES[0])
    if (!response.ok) throw new Error('Failed to fetch DeFlock data')
    const data = await response.json()
    
    let cameras = data.cameras || []
    
    if (bounds) {
      cameras = cameras.filter((cam: FlockCamera) => 
        cam.latitude >= bounds.south && cam.latitude <= bounds.north &&
        cam.longitude >= bounds.west && cam.longitude <= bounds.east
      )
    }
    
    return cameras.map((cam: any) => ({
      id: cam.id || cam.camera_id,
      latitude: cam.latitude,
      longitude: cam.longitude,
      location: cam.location || cam.description,
      type: 'ALPR'
    }))
  } catch (error) {
    console.error('Error fetching Flock cameras:', error)
    return []
  }
}

// Mock police unit locations (real APIs would require LE credentials)
export const fetchPoliceUnits = async (
  _bounds?: { north: number; south: number; east: number; west: number }
) => {
  return [
    { id: 'pd-1', latitude: 40.7128, longitude: -74.005, type: 'PATROL', status: 'ACTIVE' },
    { id: 'pd-2', latitude: 40.72, longitude: -73.99, type: 'SUPERVISOR', status: 'AVAILABLE' },
    { id: 'pd-3', latitude: 40.73, longitude: -73.98, type: 'FORENSICS', status: 'EN_ROUTE' },
  ]
}