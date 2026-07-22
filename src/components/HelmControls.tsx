export function HelmControls({
  course,
  speed,
  warpFactor,
  eta,
  onSpeedChange,
  onWarpFactorChange,
  cameraFilters,
  onCameraFilterChange,
  aircraftFilter,
  onAircraftFilterChange,
  satelliteFilter,
  onSatelliteFilterChange,
  showCrimes,
  onShowCrimesChange,
  showPolice,
  onShowPoliceChange,
}: {
  cursor: { lat: number; lng: number }
  destinationName: string
  course: number
  speed: string
  warpFactor: number
  eta: string
  onCursorChange: (lat: number, lng: number) => void
  onSpeedChange: (speed: string) => void
  onWarpFactorChange: (factor: number) => void
  cameraFilters: Record<string, boolean>
  onCameraFilterChange: (name: string, checked: boolean) => void
  aircraftFilter: string
  onAircraftFilterChange: (value: string) => void
  satelliteFilter: string
  onSatelliteFilterChange: (value: string) => void
  showCrimes: boolean
  onShowCrimesChange: (value: boolean) => void
  showPolice: boolean
  onShowPoliceChange: (value: boolean) => void
}) {
  return (
    <div className="h-full flex flex-col">
      <div className="text-[10px] font-bold tracking-[0.15em] text-gray-300/80 mb-2" style={{ fontFamily: "'Orbitron', monospace" }}>
        HELM / NAVIGATION
      </div>

      <div className="flex flex-row gap-1.5 flex-1 overflow-y-auto pr-1" style={{ display: 'flex', flexDirection: 'row', background: 'transparent' }}>
        <div className="hud-panel rounded border border-white/10 bg-black/30 p-1.5 flex-1" style={{ flex: '1 1 0%', minWidth: 0, borderLeft: '3px solid transparent', background: 'transparent' }}>
          <div className="text-[8px] text-gray-400 mb-0.5 tracking-[0.15em]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
            SENSOR FILTERS
          </div>
          <div className="text-[9px] text-gray-500 mb-0.5">CAMERAS</div>
          {['traffic', 'cctv', 'flock', 'police'].map((t) => (
            <label key={t} className="flex items-center gap-1 text-[9px] text-gray-300 cursor-pointer">
              <input
                type="checkbox"
                checked={!!cameraFilters[t]}
                onChange={(e) => onCameraFilterChange(t, e.target.checked)}
                className="accent-white"
              />
              <span className="uppercase tracking-wider">{t}</span>
            </label>
          ))}
          <div className="text-[9px] text-gray-500 mt-1 mb-0.5">AIRCRAFT</div>
          <select
            value={aircraftFilter}
            onChange={(e) => onAircraftFilterChange(e.target.value)}
            className="w-full bg-black/50 border border-white/10 rounded px-1 py-0.5 text-[9px] font-mono text-white focus:border-white/20 focus:outline-none"
          >
            <option value="all">ALL</option>
            <option value="airborne">AIRBORNE</option>
            <option value="ground">GROUND</option>
            <option value="high">HIGH (FL300+)</option>
            <option value="fast">FAST (500+)</option>
            <option value="off">OFF</option>
          </select>
          <div className="text-[9px] text-gray-500 mt-1 mb-0.5">ANOMALIES</div>
          <label className="flex items-center gap-1 text-[9px] text-gray-300 cursor-pointer">
            <input
              type="checkbox"
              checked={showCrimes}
              onChange={(e) => onShowCrimesChange(e.target.checked)}
              className="accent-white"
            />
            <span className="uppercase tracking-wider">CRIMES</span>
          </label>
          <label className="flex items-center gap-1 text-[9px] text-gray-300 cursor-pointer mt-0.5">
            <input
              type="checkbox"
              checked={showPolice}
              onChange={(e) => onShowPoliceChange(e.target.checked)}
              className="accent-white"
            />
            <span className="uppercase tracking-wider">POLICE</span>
          </label>
        </div>

        <div className="hud-panel rounded border border-white/10 bg-black/30 p-1.5 flex-1" style={{ flex: '1 1 0%', minWidth: 0, borderLeft: '3px solid transparent', background: 'transparent' }}>
          <div className="text-[8px] text-gray-400 mb-0.5 tracking-[0.15em]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
            TRACKS FILTER
          </div>
          <div className="text-[9px] text-gray-500 mb-0.5">SATELLITES</div>
          <select
            value={satelliteFilter}
            onChange={(e) => onSatelliteFilterChange(e.target.value)}
            className="w-full bg-black/50 border border-white/10 rounded px-1 py-0.5 text-[9px] font-mono text-white focus:border-white/20 focus:outline-none"
          >
            <option value="all">ALL ORBITS</option>
            <option value="geo">GEOSTATIONARY</option>
            <option value="leo">LEO</option>
            <option value="meo">MEO</option>
            <option value="off">OFF</option>
          </select>
        </div>

        <div className="hud-panel rounded border border-white/10 bg-black/30 p-1.5 flex-1" style={{ flex: '1 1 0%', minWidth: 0, borderLeft: '3px solid transparent', background: 'transparent' }}>
          <div className="text-[8px] text-gray-400 mb-0.5 tracking-[0.15em]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
            WARP FILTERS
          </div>
          <div className="text-[9px] text-gray-500 mb-0.5">SPEED BAND</div>
          <div className="flex flex-wrap gap-0.5">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((w) => (
              <button
                key={w}
                onClick={() => onWarpFactorChange(w)}
                className={`w-5 h-5 rounded text-[10px] font-bold transition-all ${
                  warpFactor === w
                    ? 'bg-white/10 border border-white/30 text-white'
                    : 'bg-black/30 border border-white/10 text-gray-500 hover:border-white/20'
                }`}
                style={{ fontFamily: "'Orbitron', monospace" }}
              >
                {w}
              </button>
            ))}
          </div>
          <div className="text-[9px] text-gray-500 mt-1 mb-0.5">MODE</div>
          <select
            value={speed}
            onChange={(e) => onSpeedChange(e.target.value)}
            className="w-full bg-black/50 border border-white/10 rounded px-1 py-0.5 text-[9px] font-mono text-white focus:border-white/20 focus:outline-none"
          >
            <option value="impulse">IMPULSE</option>
            <option value="warp">WARP</option>
            <option value="emgr">EMGR</option>
          </select>
          <div className="text-[9px] text-gray-500 mt-1">
            <span className="text-white">{eta}</span>
          </div>
        </div>

        <div className="hud-panel rounded border border-white/10 bg-black/30 p-1.5 flex-1" style={{ flex: '1 1 0%', minWidth: 0, borderLeft: '3px solid transparent', background: 'transparent' }}>
          <div className="text-[8px] text-gray-400 mb-0.5 tracking-[0.15em]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
            SENSOR INTEGRITY
          </div>
          <div className="relative w-full aspect-square max-w-[80px] mx-auto mt-1">
            <div className="absolute inset-0 border border-white/10 rounded-full" />
            <div className="absolute inset-1 border border-white/10 rounded-full" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div
                className="w-px h-6 bg-white origin-bottom"
                style={{ transform: `rotate(${course - 90}deg)`, transformOrigin: 'center bottom' }}
              />
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-1.5 h-1.5 bg-white rounded-full" />
            </div>
          </div>
          <div className="text-center text-[9px] font-mono text-white mt-0.5">{course.toFixed(1)}°</div>
        </div>
      </div>
    </div>
  )
}