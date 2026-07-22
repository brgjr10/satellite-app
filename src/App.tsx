import { useState, useEffect, useCallback, useRef } from 'react'
import GlobeVisualization, { type Camera, type CrimeIncident, type GlobeNode, type PoliceUnit } from './GlobeVisualization'
import { HelmControls } from './components/HelmControls'
import { type Aircraft, type Satellite, fetchAircraftStates } from './services/flightData'
import { fetchTLEs, fetchMergedTLEs, propagate, type TleRecord } from './services/satelliteTracking'

const ALL_GROUPS = [
  'geo', 'gps-ops', 'galileo', 'goes', 'weather', 'science', 'amateur',
  'visual', 'stations', 'intelsat', 'iridium', 'military', 'planet', 'spire',
]

function App() {
  const [cameras, _setCameras] = useState<Camera[]>([])
  const [crimes, _setCrimes] = useState<CrimeIncident[]>([])
  const [policeUnits, _setPoliceUnits] = useState<PoliceUnit[]>([])
  const [aircraft, _setAircraft] = useState<Aircraft[]>([])
  const [satellites, _setSatellites] = useState<Satellite[]>([])
  const [satGroup] = useState('all')
  const [_selectedNode, _setSelectedNode] = useState<GlobeNode | null>(null)
  const [_systemAlerts, _setSystemAlerts] = useState<string[]>([])
  const [course, _setCourse] = useState(127.4)
  const [speed, _setSpeed] = useState('warp5')
  const [warpFactor, setWarpFactor] = useState(5)
  const [destination, setDestination] = useState({ lat: 40.75, lng: -73.98, name: 'ALPHA CENTAURI' })
  const [cursor, setCursor] = useState({ lat: 40.75, lng: -73.98 })
  const [cameraFilters, setCameraFilters] = useState<Record<string, boolean>>({
    traffic: true,
    cctv: true,
    flock: true,
    police: true,
  })
  const [showCrimes, setShowCrimes] = useState(true)
  const [showPolice, setShowPolice] = useState(true)
  const [aircraftFilter, setAircraftFilter] = useState('all')
  const [satelliteFilter, setSatelliteFilter] = useState('all')

  const handleDestinationChange = useCallback((lat: number, lng: number) => {
    setDestination(prev => ({ ...prev, lat, lng }))
    setCursor({ lat, lng })
  }, [])

  const handleGlobeCursorChange = useCallback((lat: number, lng: number) => {
    setCursor({ lat, lng })
  }, [])

  const handleNodeClick = useCallback((_node: GlobeNode | null) => {
    // node selection handled in visualization
  }, [])

  useEffect(() => {
    const mockCameras: Camera[] = [
      { id: '1', name: 'UPSILON-3 SENSOR', latitude: 40.7128, longitude: -74.006, type: 'traffic' },
      { id: '2', name: 'SIGMA-7 OUTPOST', latitude: 40.72, longitude: -73.99, type: 'cctv' },
      { id: '3', name: 'DELTA RELAY', latitude: 40.73, longitude: -73.98, type: 'flock' },
      { id: '4', name: 'OMEGA STATION', latitude: 40.74, longitude: -73.97, type: 'police' },
    ]
    _setCameras(mockCameras)

    const mockCrimes: CrimeIncident[] = [
      { id: 'c1', latitude: 40.715, longitude: -74.002, category: 'ANOMALY DETECTED', date: '2024-01-15', description: 'Unknown spatial signature' },
      { id: 'c2', latitude: 40.725, longitude: -73.995, category: 'RADIOACTIVE ZONE', date: '2024-01-15', description: 'Background radiation spike' },
    ]
    _setCrimes(mockCrimes)

    const mockUnits: PoliceUnit[] = [
      { id: 'p1', latitude: 40.71, longitude: -74.005, type: 'PATROL', status: 'ACTIVE' },
      { id: 'p2', latitude: 40.722, longitude: -73.992, type: 'SUPERVISOR', status: 'AVAILABLE' },
    ]
    _setPoliceUnits(mockUnits)
  }, [])

  const tleRecordsRef = useRef<TleRecord[]>([])

  useEffect(() => {
    let cancelled = false
    tleRecordsRef.current = []
    const loadTLEs = async () => {
      try {
        const records = satGroup === 'all'
          ? await fetchMergedTLEs(ALL_GROUPS)
          : await fetchTLEs({ group: satGroup })
        if (cancelled) return
        tleRecordsRef.current = records
        _setSatellites(propagate(records))
      } catch (err) {
        console.error('Error loading satellite TLEs:', err)
      }
    }
    loadTLEs()
    const propagateId = setInterval(() => {
      if (tleRecordsRef.current.length) {
        _setSatellites(propagate(tleRecordsRef.current))
      }
    }, 10000)
    const refreshId = setInterval(loadTLEs, 30 * 60 * 1000)
    return () => {
      cancelled = true
      clearInterval(propagateId)
      clearInterval(refreshId)
    }
  }, [satGroup])

  useEffect(() => {
    let cancelled = false
    const loadAircraft = async () => {
      try {
        const states = await fetchAircraftStates()
        if (cancelled) return
        _setAircraft(states.slice(0, 800))
      } catch (err) {
        console.error('Error loading aircraft:', err)
      }
    }
    loadAircraft()
    const id = setInterval(loadAircraft, 30000)
    return () => {
      cancelled = true
      clearInterval(id)
    }
  }, [])

  const handleWarpFactorChange = useCallback((factor: number) => {
    setWarpFactor(factor)
  }, [])

  const handleCameraFilterChange = useCallback((name: string, checked: boolean) => {
    setCameraFilters((prev) => ({ ...prev, [name]: checked }))
  }, [])

  const handleAircraftFilterChange = useCallback((value: string) => {
    setAircraftFilter(value)
  }, [])

  const handleSatelliteFilterChange = useCallback((value: string) => {
    setSatelliteFilter(value)
  }, [])

  const handleShowCrimesChange = useCallback((value: boolean) => {
    setShowCrimes(value)
  }, [])

  const handleShowPoliceChange = useCallback((value: boolean) => {
    setShowPolice(value)
  }, [])

  const filteredCameras = cameras.filter((c) => cameraFilters[c.type])
  const filteredCrimes = showCrimes ? crimes : []
  const filteredPoliceUnits = showPolice ? policeUnits : []
  const filteredAircraft = aircraftFilter === 'off' ? [] : aircraft.filter((a) => {
    if (aircraftFilter === 'airborne') return !a.on_ground
    if (aircraftFilter === 'ground') return a.on_ground
    if (aircraftFilter === 'high') return (a.altitude / 100) >= 300
    if (aircraftFilter === 'fast') return (a.velocity * 1.94384) >= 500
    return true
  })
  const filteredSatellites = satelliteFilter === 'off' ? [] : satellites.filter((s) => {
    if (satelliteFilter === 'all') return true
    if (satelliteFilter === 'geo') return s.int_des?.startsWith('GEO')
    if (satelliteFilter === 'leo') return s.altitude >= 160 && s.altitude <= 2000
    if (satelliteFilter === 'meo') return s.altitude > 2000 && s.altitude < 35786
    return true
  })

  return (
    <div className="bg-black text-white h-screen flex flex-col">
      <div className="relative z-10 h-full flex flex-col">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-4 py-2 bg-black/60 border-b border-white/10 flex-shrink-0">
          <div className="text-lg font-bold text-gray-300" style={{ fontFamily: "'Orbitron', monospace" }}>
            USS DISCOVERY
          </div>
          <div className="flex-1" />
        </div>

        {/* Main Content Area */}
        <div className="flex-1 min-h-0 flex gap-2 p-2">
          {/* Left Panel: Helm Controls */}
          <div className="hidden lg:flex w-[26rem] min-h-0">
            <div className="hud-panel rounded p-3 w-full">
              <HelmControls
                cursor={cursor}
                destinationName={destination.name}
                course={course}
                speed={speed}
                warpFactor={warpFactor}
                eta="42m 17s"
                onCursorChange={handleDestinationChange}
                onSpeedChange={() => {}}
                onWarpFactorChange={handleWarpFactorChange}
                cameraFilters={cameraFilters}
                onCameraFilterChange={handleCameraFilterChange}
                aircraftFilter={aircraftFilter}
                onAircraftFilterChange={handleAircraftFilterChange}
                satelliteFilter={satelliteFilter}
                onSatelliteFilterChange={handleSatelliteFilterChange}
                showCrimes={showCrimes}
                onShowCrimesChange={handleShowCrimesChange}
                showPolice={showPolice}
                onShowPoliceChange={handleShowPoliceChange}
              />
            </div>
          </div>

          {/* Center Panel: Navigation Console */}
          <div className="flex-1 min-h-0 relative">
            <GlobeVisualization
              cameras={filteredCameras}
              crimes={filteredCrimes}
              policeUnits={filteredPoliceUnits}
              aircraft={filteredAircraft}
              satellites={filteredSatellites}
              destination={destination}
              onCursorChange={handleGlobeCursorChange}
              onNodeClick={handleNodeClick}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
