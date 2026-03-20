'use client'

interface Props {
  ventasPorDia: Record<string, number>
  ocupacion: { label: string; ocupados: number; total: number }[]
  activos: number
  usados: number
}

export function AdminCharts({ ventasPorDia, ocupacion, activos, usados }: Props) {
  const diasEntries = Object.entries(ventasPorDia)
  const maxVenta = Math.max(...diasEntries.map(([, v]) => v), 1)
  const totalTiquetes = activos + usados

  const dayLabel = (iso: string) => {
    const d = new Date(iso + 'T12:00:00')
    return d.toLocaleDateString('es-CO', { weekday: 'short', day: 'numeric' })
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
      {/* Ventas por dia */}
      <div style={{ background: '#12121e', borderRadius: 16, padding: '1.5rem', border: '1px solid rgba(255,255,255,0.07)' }}>
        <h3 style={{ fontWeight: 700, fontSize: 15, marginBottom: '1.25rem', color: 'rgba(255,255,255,0.85)' }}>
          💵 Ventas ultimos 7 dias
        </h3>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 120 }}>
          {diasEntries.map(([dia, valor]) => {
            const pct = maxVenta > 0 ? (valor / maxVenta) * 100 : 0
            return (
              <div key={dia} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, height: '100%', justifyContent: 'flex-end' }}>
                <div title={`$${valor.toLocaleString('es-CO')}`} style={{
                  width: '100%', background: valor > 0 ? '#f97316' : 'rgba(255,255,255,0.06)',
                  borderRadius: '4px 4px 0 0', height: `${Math.max(pct, valor > 0 ? 8 : 4)}%`,
                  transition: 'height 0.5s', minHeight: 4,
                }} />
                <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)', textAlign: 'center', lineHeight: 1.2 }}>
                  {dayLabel(dia)}
                </span>
              </div>
            )
          })}
        </div>
        <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>Total semana</span>
          <span style={{ fontWeight: 700, color: '#f97316', fontSize: 14 }}>
            ${diasEntries.reduce((s, [, v]) => s + v, 0).toLocaleString('es-CO')}
          </span>
        </div>
      </div>

      {/* Estado de tiquetes */}
      <div style={{ background: '#12121e', borderRadius: 16, padding: '1.5rem', border: '1px solid rgba(255,255,255,0.07)' }}>
        <h3 style={{ fontWeight: 700, fontSize: 15, marginBottom: '1.25rem', color: 'rgba(255,255,255,0.85)' }}>
          🎟️ Estado de tiquetes
        </h3>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
          {/* Donut chart SVG */}
          <svg width={140} height={140} viewBox="0 0 140 140">
            {totalTiquetes === 0 ? (
              <circle cx={70} cy={70} r={50} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={18} />
            ) : (() => {
              const r = 50
              const circ = 2 * Math.PI * r
              const activoPct = activos / totalTiquetes
              const usadoPct = usados / totalTiquetes
              return (
                <>
                  <circle cx={70} cy={70} r={r} fill="none" stroke="#10b981" strokeWidth={18}
                    strokeDasharray={`${activoPct * circ} ${circ}`}
                    strokeDashoffset={circ * 0.25}
                    style={{ transform: 'rotate(-90deg)', transformOrigin: '70px 70px' }} />
                  <circle cx={70} cy={70} r={r} fill="none" stroke="#6b7280" strokeWidth={18}
                    strokeDasharray={`${usadoPct * circ} ${circ}`}
                    strokeDashoffset={-(activoPct * circ) + circ * 0.25}
                    style={{ transform: 'rotate(-90deg)', transformOrigin: '70px 70px' }} />
                  <text x={70} y={66} textAnchor="middle" fill="white" fontSize={20} fontWeight="bold">{totalTiquetes}</text>
                  <text x={70} y={82} textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize={10}>total</text>
                </>
              )
            })()}
          </svg>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[
            { label: 'Activos', value: activos, color: '#10b981' },
            { label: 'Usados', value: usados, color: '#6b7280' },
          ].map(({ label, value, color }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: color }} />
                <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)' }}>{label}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 80, height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ width: `${totalTiquetes > 0 ? (value / totalTiquetes) * 100 : 0}%`, height: '100%', background: color, borderRadius: 3 }} />
                </div>
                <span style={{ fontSize: 13, fontWeight: 700, minWidth: 24, textAlign: 'right' }}>{value}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Ocupacion proximas funciones */}
      <div style={{ background: '#12121e', borderRadius: 16, padding: '1.5rem', border: '1px solid rgba(255,255,255,0.07)', gridColumn: ocupacion.length ? 'span 2' : undefined }}>
        <h3 style={{ fontWeight: 700, fontSize: 15, marginBottom: '1.25rem', color: 'rgba(255,255,255,0.85)' }}>
          💺 Ocupacion proximas funciones
        </h3>
        {ocupacion.length === 0 ? (
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13, textAlign: 'center', padding: '1.5rem 0' }}>No hay funciones proximas</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {ocupacion.map((f, i) => {
              const pct = Math.round((f.ocupados / f.total) * 100)
              const barColor = pct > 80 ? '#ef4444' : pct > 50 ? '#f59e0b' : '#10b981'
              return (
                <div key={i}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                    <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>{f.label}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: barColor }}>{f.ocupados}/{f.total} ({pct}%)</span>
                  </div>
                  <div style={{ height: 7, background: 'rgba(255,255,255,0.06)', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: barColor, borderRadius: 4, transition: 'width 0.5s' }} />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
