import type { ShipSystem } from '../services/shipData'

interface SystemsPanelProps {
  systems: ShipSystem[]
  alertLevel: 'green' | 'yellow' | 'red'
}

export function SystemsPanel({ systems, alertLevel }: SystemsPanelProps) {
  const getStatusColor = (status: ShipSystem['status']) => {
    switch (status) {
      case 'nominal': return 'text-green-400'
      case 'warning': return 'text-yellow-400'
      case 'critical': return 'text-red-500'
      case 'offline': return 'text-gray-500'
      default: return 'text-cyan-300'
    }
  }

  const alertColor = alertLevel === 'red' ? 'text-red-500' : alertLevel === 'yellow' ? 'text-yellow-400' : 'text-green-400'

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <div className="text-xs font-bold tracking-[0.2em] text-cyan-300/80" style={{ fontFamily: "'Orbitron', monospace" }}>
          SHIP SYSTEMS
        </div>
        <div className={`text-[10px] font-bold tracking-widest ${alertColor} animate-pulse`} style={{ fontFamily: "'JetBrains Mono', monospace" }}>
          ALERT LEVEL: {alertLevel.toUpperCase()}
        </div>
      </div>

      <div className="space-y-2 flex-1 overflow-y-auto pr-1">
        <div className="hud-panel rounded border border-cyan-500/20 bg-black/30 p-2">
          <div className="text-[9px] text-cyan-300/50 mb-1 tracking-[0.15em]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
            INTEGRITY STATUS
          </div>
          {systems.map((system) => {
            const percent = (system.value / system.max) * 100
            return (
              <div key={system.id} className="mb-2">
                <div className="flex justify-between items-baseline mb-0.5">
                  <span className={`text-[10px] font-mono ${getStatusColor(system.status)}`}>
                    {system.name}
                  </span>
                  <span className={`text-[10px] font-mono ${getStatusColor(system.status)}`}>
                    {system.value.toFixed(1)}{system.unit}
                  </span>
                </div>
                <div className="h-1.5 bg-gray-900/80 rounded-full overflow-hidden border border-white/5">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${getStatusColor(system.status).replace('text-', 'bg-')}`}
                    style={{
                      width: `${Math.min(percent, 100)}%`,
                      boxShadow: `0 0 8px currentColor`,
                    }}
                  />
                </div>
              </div>
            )
          })}
        </div>

        <div className="hud-panel rounded border border-cyan-500/20 bg-black/30 p-2">
          <div className="text-[9px] text-cyan-300/50 mb-1 tracking-[0.15em]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
            REACTOR OUTPUT
          </div>
          <div className="flex items-center justify-between">
            <div className="text-[10px] font-mono text-cyan-200">WARP CORE</div>
            <div className="text-[10px] font-mono text-green-400 animate-pulse">ONLINE</div>
          </div>
          <div className="h-12 mt-1 relative">
            <div className="absolute inset-0 flex items-end gap-1">
              {Array.from({ length: 20 }, (_, i) => {
                const height = 20 + Math.sin(Date.now() / 500 + i * 0.5) * 30 + Math.random() * 20
                return (
                  <div
                    key={i}
                    className="flex-1 bg-green-500/60 rounded-t transition-all duration-300"
                    style={{
                      height: `${height}%`,
                      boxShadow: '0 0 4px rgba(0, 255, 0, 0.5)',
                    }}
                  />
                )
              })}
            </div>
          </div>
        </div>

        <div className="hud-panel rounded border border-cyan-500/20 bg-black/30 p-2">
          <div className="text-[9px] text-cyan-300/50 mb-1 tracking-[0.15em]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
            DEFLECTOR FIELD
          </div>
          <div className="h-8 relative border border-cyan-500/10 rounded overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent animate-pulse" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 border-2 border-cyan-500/50 rounded-full animate-spin" style={{ animationDuration: '8s' }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
