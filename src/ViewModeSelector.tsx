import { useEffect } from 'react'

interface ViewModeSelectorProps {
  currentMode: 'passive' | 'active' | 'long_range' | 'emergency'
}

export function ViewModeSelector({ currentMode }: ViewModeSelectorProps) {
  useEffect(() => {
    const root = document.documentElement
    const modes: Record<string, { filter: string; bg: string }> = {
      passive: { filter: 'saturate(0.8) brightness(1.05)', bg: 'linear-gradient(135deg, #0a0a1a 0%, #0d1117 100%)' },
      active: { filter: 'saturate(1.2) brightness(1.1)', bg: 'linear-gradient(135deg, #0f1f1a 0%, #0d1117 100%)' },
      long_range: { filter: 'saturate(0.6) brightness(0.9)', bg: 'linear-gradient(135deg, #1a0f1a 0%, #0d1117 100%)' },
      emergency: { filter: 'saturate(1.5) brightness(1.2)', bg: 'linear-gradient(135deg, #1f0f0f 0%, #0d1117 100%)' },
    }
    
    const mode = modes[currentMode] || modes.passive
    root.style.setProperty('--filter-mode', mode.filter)
    root.style.setProperty('--bg-mode', mode.bg)
  }, [currentMode])

  return null
}
