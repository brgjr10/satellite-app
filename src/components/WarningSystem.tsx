import type { CommunicationEntry } from '../services/shipData'

interface WarningSystemProps {
  communications: CommunicationEntry[]
  systemAlerts: string[]
}

export function WarningSystem({ communications, systemAlerts }: WarningSystemProps) {
  const getPriorityColor = (priority: CommunicationEntry['priority']) => {
    switch (priority) {
      case 'emergency': return 'border-red-500/50 bg-red-500/5'
      case 'priority': return 'border-yellow-500/30 bg-yellow-500/5'
      default: return 'border-white/5 bg-black/20'
    }
  }

  const getPriorityTextColor = (priority: CommunicationEntry['priority']) => {
    switch (priority) {
      case 'emergency': return 'text-red-400'
      case 'priority': return 'text-yellow-400'
      default: return 'text-cyan-300/70'
    }
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-2">
        <div className="text-[10px] font-bold tracking-[0.15em] text-cyan-300/80" style={{ fontFamily: "'Orbitron', monospace" }}>
          SUBSPACE COMMUNICATIONS
        </div>
        <div className="text-[9px] font-mono text-cyan-300/50">ENCRYPTED CHANNEL</div>
      </div>

      {systemAlerts.length > 0 && (
        <div className="mb-2 space-y-1">
          {systemAlerts.map((alert, i) => (
            <div
              key={i}
              className="p-1.5 rounded border border-red-500/30 bg-red-500/5 text-[10px] font-mono text-red-400 animate-pulse"
            >
              {alert}
            </div>
          ))}
        </div>
      )}

      <div className="space-y-1.5 flex-1 overflow-y-auto pr-1">
        {communications.map((msg) => (
          <div
            key={msg.id}
            className={`p-2 rounded border ${getPriorityColor(msg.priority)}`}
          >
            <div className="flex items-center justify-between mb-0.5">
              <span className={`text-[10px] font-bold font-mono ${getPriorityTextColor(msg.priority)}`}>
                {msg.source}
              </span>
              <span className="text-[9px] font-mono text-gray-500">{msg.timestamp}</span>
            </div>
            <div className="text-[10px] font-mono text-white/80 leading-relaxed">
              {msg.message}
            </div>
            <div className="text-[8px] font-mono text-cyan-300/40 mt-0.5">
              {msg.channel}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-2 pt-2 border-t border-white/5">
        <div className="text-[9px] font-mono text-gray-500 flex justify-between">
          <span>CH 1: BRIDGE</span>
          <span>CH 2: COMMAND</span>
          <span>CH 3: TACTICAL</span>
          <span className="text-cyan-300/50">ACTIVE</span>
        </div>
      </div>
    </div>
  )
}
