export interface ShipSystem {
  id: string
  name: string
  status: 'nominal' | 'warning' | 'critical' | 'offline'
  value: number
  max: number
  unit: string
}

export interface SensorContact {
  id: string
  name: string
  type: 'starship' | 'station' | 'anomaly' | 'freighter' | 'shuttle' | 'unknown'
  bearing: number
  range: number
  speed: number
  status: 'friendly' | 'hostile' | 'neutral' | 'unknown'
  lastSeen: string
}

export interface CommunicationEntry {
  id: string
  timestamp: string
  source: string
  message: string
  priority: 'routine' | 'priority' | 'emergency'
  channel: string
}

export interface NavigationPoint {
  id: string
  name: string
  lat: number
  lng: number
  type: 'star_system' | 'nebula' | 'anomaly' | 'station' | 'beacon'
  color: string
}

export const SHIP_STATUS: ShipSystem[] = [
  { id: 'hull', name: 'HULL INTEGRITY', status: 'nominal', value: 98.4, max: 100, unit: '%' },
  { id: 'shields', name: 'DEFLECTOR SHIELDS', status: 'nominal', value: 100, max: 100, unit: '%' },
  { id: 'warp', name: 'WARP CORE', status: 'nominal', value: 87.2, max: 100, unit: '%' },
  { id: 'impulse', name: 'IMPULSE ENGINES', status: 'nominal', value: 92.1, max: 100, unit: '%' },
  { id: 'weapons', name: 'PHASER BANKS', status: 'nominal', value: 100, max: 100, unit: '%' },
  { id: 'torpedoes', name: 'PHOTON TORPEDOES', status: 'warning', value: 12, max: 24, unit: '' },
  { id: 'life', name: 'LIFE SUPPORT', status: 'nominal', value: 100, max: 100, unit: '%' },
  { id: 'sensors', name: 'SENSOR ARRAY', status: 'nominal', value: 100, max: 100, unit: '%' },
]

export const INITIAL_CONTACTS: SensorContact[] = [
  { id: 'c1', name: 'USS ENTERPRISE', type: 'starship', bearing: 127.4, range: 24000, speed: 0.8, status: 'friendly', lastSeen: '2.4s ago' },
  { id: 'c2', name: 'DS9', type: 'station', bearing: 284.1, range: 85000, speed: 0, status: 'friendly', lastSeen: '1.1s ago' },
  { id: 'c3', name: 'UNKNOWN VESSEL', type: 'unknown', bearing: 45.2, range: 15000, speed: 0.5, status: 'unknown', lastSeen: '0.3s ago' },
  { id: 'c4', name: 'ROMULAN WARBIRD', type: 'starship', bearing: 310.8, range: 45000, speed: 0.3, status: 'hostile', lastSeen: '3.2s ago' },
  { id: 'c5', name: 'FERENGI MARAUDER', type: 'freighter', bearing: 68.3, range: 32000, speed: 0.2, status: 'neutral', lastSeen: '5.1s ago' },
]

export const COMMUNICATION_LOG: CommunicationEntry[] = [
  { id: 'msg1', timestamp: '14:32:07', source: 'STARFLEET COMMAND', message: 'ALL SHIPS: SECTOR 001-ALPHA CODE ORANGE', priority: 'emergency', channel: 'STARFLEET PRIORITY' },
  { id: 'msg2', timestamp: '14:31:45', source: 'USS ENTERPRISE', message: 'ENTERPRISE TO DISCOVERY: RENDEZVOUS AT GRID 7', priority: 'priority', channel: 'INTERTACTICAL' },
  { id: 'msg3', timestamp: '14:30:22', source: 'DEEP SPACE 9', message: 'DOCKING BAY 3 CLEARED FOR YOUR ARRIVAL', priority: 'routine', channel: 'STATION OPS' },
  { id: 'msg4', timestamp: '14:28:55', source: 'SENSOR ARRAY', message: 'UNKNOWN SIGNATURE DETECTED BEARING 045', priority: 'priority', channel: 'TACTICAL' },
  { id: 'msg5', timestamp: '14:27:10', source: 'HELM', message: 'COURSE CORRECTION COMPLETE. ON NEW BEARING.', priority: 'routine', channel: 'BRIDGE' },
]

export const STELLAR_MAP_POINTS: NavigationPoint[] = [
  { id: 's1', name: 'EARTH', lat: 40.7128, lng: -74.006, type: 'star_system', color: '#00ffff' },
  { id: 's2', name: 'ALPHA CENTAURI', lat: 40.73, lng: -73.98, type: 'star_system', color: '#00ffff' },
  { id: 's3', name: 'VULCAN', lat: 40.72, lng: -73.99, type: 'star_system', color: '#00ffff' },
  { id: 's4', name: 'BETAZED', lat: 40.74, lng: -73.97, type: 'star_system', color: '#00ffff' },
  { id: 'a1', name: 'SECTOR 001 ANOMALY', lat: 40.715, lng: -74.002, type: 'anomaly', color: '#ff0066' },
  { id: 'a2', name: 'WARP NEXUS', lat: 40.25, lng: -73.85, type: 'nebula', color: '#ff00ff' },
  { id: 'n1', name: 'DS9', lat: 40.725, lng: -73.995, type: 'station', color: '#ffff00' },
  { id: 'n2', name: 'STARBASE 001', lat: 40.71, lng: -74.005, type: 'beacon', color: '#00ff00' },
]

export const generateMockContacts = (): SensorContact[] => {
  const names = [
    'UNKNOWN VESSEL', 'ROMULAN SCOUT', 'KLINGON BIRD-OF-PREY', 'CARDASSIAN GALOR',
    'FERENGI D\'KORA', 'BORG CUBE', 'DOMINION SHIP', 'BREEN VESSEL'
  ]
  const types: SensorContact['type'][] = ['starship', 'starship', 'starship', 'freighter', 'shuttle', 'anomaly', 'unknown', 'unknown']
  const statuses: SensorContact['status'][] = ['hostile', 'hostile', 'hostile', 'neutral', 'friendly', 'neutral', 'unknown', 'unknown']
  
  return Array.from({ length: 8 }, (_, i) => ({
    id: `contact-${i}`,
    name: names[i],
    type: types[i],
    bearing: Math.random() * 360,
    range: Math.floor(Math.random() * 100000) + 5000,
    speed: Math.random() * 2,
    status: statuses[i],
    lastSeen: `${(Math.random() * 10).toFixed(1)}s ago`,
  }))
}
