'use client'

interface Props {
  ventasPorDia: Record<string, number>
  ocupacion: { label: string; hora: string; ocupados: number; total: number }[]
  activos: number
  usados: number
}

export function AdminCharts({ ventasPorDia, ocupacion, activos, usados }: Props) {
  const diasEntries = Object.entries(ventasPorDia)
  const maxVenta = Math.max(...diasEntries.map(([, v]) => v), 1)
  const totalTiquetes = activos + usados
  const totalSemana = diasEntries.reduce((s, [, v]) => s + v, 0)

  const dayLabel = (iso: string) => {
    const d = new Date(iso + 'T12:00:00')
    return d.toLocaleDateString('es-CO', { weekday: 'short' }).slice(0, 3)
  }

  const r = 52
  const circ = 2 * Math.PI * r
  const activoPct = totalTiquetes > 0 ? activos / totalTiquetes : 0
  const usadoPct = totalTiquetes > 0 ? usados / totalTiquetes : 0

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>

      {/* Ventas por día */}
      <div className="card animate-fade-up" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
          <div>
            <p style={{ fontSize: 12, fontWeight: 700, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Ventas</p>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0a0f1e' }}>Últimos 7 días</h3>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 20, fontWeight: 900, color: '#2563eb' }}>${totalSemana.toLocaleString('es-CO')}</div>
            <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>total semana</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 100 }}>
          {diasEntries.map(([dia, valor]) => {
            const pct = (valor / maxVenta) * 100
            const isToday = dia === new Date().toISOString().split('T')[0]
            return (
              <div key={dia} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, height: '100%', justifyContent: 'flex-end' }}>
                <div
                  title={`$${valor.toLocaleString('es-CO')}`}
                  style={{
                    width: '100%', borderRadius: '6px 6px 0 0',
                    height: `${Math.max(pct, valor > 0 ? 10 : 5)}%`,
                    background: isToday ? '#2563eb' : valor > 0 ? '#bfdbfe' : '#f1f5f9',
                    transition: 'height 0.6s cubic-bezier(0.34,1.56,0.64,1)',
                    minHeight: 5,
                  }}
                />
                <span style={{ fontSize: 10, color: isToday ? '#2563eb' : '#94a3b8', fontWeight: isToday ? 800 : 600 }}>
                  {dayLabel(dia)}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Donut tiquetes */}
      <div className="card animate-fade-up delay-1" style={{ padding: '1.5rem' }}>
        <div style={{ marginBottom: '1.25rem' }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Tiquetes</p>
          <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0a0f1e' }}>Estado actual</h3>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <svg width={120} height={120} viewBox="0 0 120 120" style={{ flexShrink: 0 }}>
            {totalTiquetes === 0 ? (
              <circle cx={60} cy={60} r={r} fill="none" stroke="#f1f5f9" strokeWidth={14} />
            ) : (
              <>
                <circle cx={60} cy={60} r={r} fill="none" stroke="#f1f5f9" strokeWidth={14} />
                <circle cx={60} cy={60} r={r} fill="none" stroke="#2563eb" strokeWidth={14}
                  strokeDasharray={`${activoPct * circ} ${circ}`}
                  strokeLinecap="round"
                  style={{ transform: 'rotate(-90deg)', transformOrigin: '60px 60px', transition: 'stroke-dasharray 0.8s ease' }} />
                <circle cx={60} cy={60} r={r} fill="none" stroke="#bfdbfe" strokeWidth={14}
                  strokeDasharray={`${usadoPct * circ} ${circ}`}
                  strokeLinecap="round"
                  style={{ transform: `rotate(${-90 + activoPct * 360}deg)`, transformOrigin: '60px 60px', transition: 'stroke-dasharray 0.8s ease' }} />
              </>
            )}
            <text x={60} y={55} textAnchor="middle" fill="#0a0f1e" fontSize={18} fontWeight="900" fontFamily="Plus Jakarta Sans, sans-serif">{totalTiquetes}</text>
            <text x={60} y={70} textAnchor="middle" fill="#94a3b8" fontSize={10} fontFamily="Plus Jakarta Sans, sans-serif">total</text>
          </svg>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { label: 'Activos', value: activos, color: '#2563eb', bg: '#dbeafe' },
              { label: 'Usados', value: usados, color: '#7c3aed', bg: '#ede9fe' },
            ].map(({ label, value, color, bg }) => (
              <div key={label}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: color }} />
                    <span style={{ fontSize: 13, color: '#64748b', fontWeight: 600 }}>{label}</span>
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 800, color: '#0a0f1e' }}>{value}</span>
                </div>
                <div style={{ height: 6, background: '#f1f5f9', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{
                    width: `${totalTiquetes > 0 ? (value / totalTiquetes) * 100 : 0}%`,
                    height: '100%', background: color, borderRadius: 4,
                    transition: 'width 0.8s ease',
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Ocupación funciones */}
      <div className="card animate-fade-up delay-2" style={{ padding: '1.5rem', gridColumn: ocupacion.length > 3 ? 'span 2' : undefined }}>
        <div style={{ marginBottom: '1.25rem' }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Sala</p>
          <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0a0f1e' }}>Ocupación próximas funciones</h3>
        </div>

        {ocupacion.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8', fontSize: 14 }}>
            No hay funciones próximas programadas
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {ocupacion.map((f, i) => {
              const pct = Math.round((f.ocupados / f.total) * 100)
              const color = pct > 80 ? '#dc2626' : pct > 50 ? '#f59e0b' : '#2563eb'
              const bg = pct > 80 ? '#fee2e2' : pct > 50 ? '#fef3c7' : '#dbeafe'
              return (
                <div key={i}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <div>
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#0a0f1e' }}>{f.label}</span>
                      <span style={{ fontSize: 11, color: '#94a3b8', marginLeft: 6 }}>{f.hora}</span>
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 800, color, background: bg, padding: '2px 8px', borderRadius: 6 }}>
                      {f.ocupados}/{f.total} · {pct}%
                    </span>
                  </div>
                  <div style={{ height: 7, background: '#f1f5f9', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 4, transition: 'width 0.8s ease' }} />
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
