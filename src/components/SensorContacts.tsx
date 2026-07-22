import type { SensorContact } from '../services/shipData'

interface SensorContactsProps {
  contacts: SensorContact[]
  selectedContact: SensorContact | null
  onSelectContact: (contact: SensorContact) => void
  sensorMode: 'passive' | 'active' | 'long_range' | 'emergency'
}

export function SensorContacts({ contacts, selectedContact, onSelectContact, sensorMode }: SensorContactsProps) {
  const getTypeIcon = (type: SensorContact['type']) => {
    switch (type) {
      case 'starship': return '▲'
      case 'station': return '◆'
      case 'anomaly': return '◈'
      case 'freighter': return '►'
      case 'shuttle': return '▸'
      default: return '?'
    }
  }

  const getStatusColor = (status: SensorContact['status']) => {
    switch (status) {
      case 'friendly': return 'text-green-400'
      case 'hostile': return 'text-red-500'
      case 'neutral': return 'text-yellow-400'
      case 'unknown': return 'text-cyan-400'
      default: return 'text-gray-400'
    }
  }

  const getStatusBorder = (status: SensorContact['status']) => {
    switch (status) {
      case 'friendly': return 'border-green-500/30'
      case 'hostile': return 'border-red-500/50'
      case 'neutral': return 'border-yellow-500/30'
      case 'unknown': return 'border-cyan-500/30'
      default: return 'border-white/10'
    }
  }

  const formatRange = (range: number) => {
    if (range >= 1000) return `${(range / 1000).toFixed(1)}k km`
    return `${range.toFixed(0)} km`
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <div className="text-xs font-bold tracking-[0.2em] text-cyan-300/80" style={{ fontFamily: "'Orbitron', monospace" }}>
          SENSOR CONTACTS
        </div>
        <div className="text-[10px] font-mono text-cyan-300/50">
          {contacts.length} OBJECTS
        </div>
      </div>

      <div className="space-y-1.5 flex-1 overflow-y-auto pr-1">
        {contacts.map((contact) => (
          <button
            key={contact.id}
            onClick={() => onSelectContact(contact)}
            className={`w-full text-left p-2 rounded border transition-all duration-200 ${
              selectedContact?.id === contact.id
                ? `${getStatusBorder(contact.status)} bg-cyan-900/20`
                : 'border-white/5 bg-black/20 hover:bg-white/5'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <span className={`text-sm ${getStatusColor(contact.status)}`}>
                  {getTypeIcon(contact.type)}
                </span>
                <span className="text-[11px] font-mono text-white/90 truncate max-w-[120px]">
                  {contact.name}
                </span>
              </div>
              {contact.status === 'hostile' && (
                <span className="text-[8px] text-red-500 animate-pulse font-bold">!</span>
              )}
            </div>
            
            <div className="grid grid-cols-3 gap-1 text-[9px] font-mono text-gray-400">
              <div>
                <span className="text-cyan-300/50">BRG</span>
                <span className="ml-1 text-white/70">{contact.bearing.toFixed(1)}°</span>
              </div>
              <div>
                <span className="text-cyan-300/50">RNG</span>
                <span className="ml-1 text-white/70">{formatRange(contact.range)}</span>
              </div>
              <div>
                <span className="text-cyan-300/50">SPD</span>
                <span className="ml-1 text-white/70">{contact.speed.toFixed(1)}w</span>
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className="mt-3 pt-2 border-t border-white/5">
        <div className="flex items-center justify-between text-[9px] font-mono text-gray-500">
          <span>SENSOR MODE: <span className="text-cyan-300/70 uppercase">{sensorMode.replace('_', ' ')}</span></span>
          <span className={sensorMode === 'active' ? 'text-green-400 animate-pulse' : ''}>
            {sensorMode === 'active' ? 'TRANSMITTING' : sensorMode === 'long_range' ? 'DEEP SCAN' : 'MONITORING'}
          </span>
        </div>
      </div>
    </div>
  )
}
