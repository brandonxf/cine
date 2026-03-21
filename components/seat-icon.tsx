'use client'

interface SeatIconProps {
  state: 'available' | 'selected' | 'occupied'
  size?: number
}

const COLORS = {
  available: { body: '#dbeafe', border: '#93c5fd', back: '#bfdbfe', arm: '#93c5fd' },
  selected:  { body: '#2563eb', border: '#1d4ed8', back: '#1d4ed8', arm: '#1e40af' },
  occupied:  { body: '#e2e8f0', border: '#cbd5e1', back: '#cbd5e1', arm: '#cbd5e1' },
}

export function SeatIcon({ state, size = 28 }: SeatIconProps) {
  const c = COLORS[state]
  const w = size
  const h = Math.round(size * 1.1)

  return (
    <svg width={w} height={h} viewBox="0 0 28 31" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Respaldo */}
      <rect x="3" y="1" width="22" height="14" rx="3" fill={c.back} stroke={c.border} strokeWidth="1.5"/>
      {/* Asiento / base */}
      <rect x="1" y="16" width="26" height="10" rx="3" fill={c.body} stroke={c.border} strokeWidth="1.5"/>
      {/* Pata izquierda */}
      <rect x="3" y="26" width="4" height="4" rx="1.5" fill={c.arm} />
      {/* Pata derecha */}
      <rect x="21" y="26" width="4" height="4" rx="1.5" fill={c.arm} />
      {/* Brazo izquierdo */}
      <rect x="1" y="13" width="3" height="10" rx="1.5" fill={c.arm} stroke={c.border} strokeWidth="1"/>
      {/* Brazo derecho */}
      <rect x="24" y="13" width="3" height="10" rx="1.5" fill={c.arm} stroke={c.border} strokeWidth="1"/>
    </svg>
  )
}
