'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import type { Asiento } from '@/lib/supabase/types'

interface Props {
  asientos: Asiento[]
  idsOcupados: string[]
  funcionId: string
  precio: number
  userId: string
}

function generarCodigo() {
  return 'TKT-' + Math.random().toString(36).substring(2, 6).toUpperCase() + '-' + Date.now().toString(36).toUpperCase()
}

export function SeatSelector({ asientos, idsOcupados, funcionId, precio, userId }: Props) {
  const [seleccionados, setSeleccionados] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()
  const ocupadosSet = new Set(idsOcupados)
  const filas = [...new Set(asientos.map(a => a.fila))].sort()
  const total = seleccionados.length * precio

  const toggle = (id: string) => {
    if (ocupadosSet.has(id)) return
    setSeleccionados(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  const comprar = async () => {
    if (!seleccionados.length) return
    setLoading(true); setError('')
    try {
      const codigo = generarCodigo()
      const { data: tiquete, error: tErr } = await supabase
        .from('tiquetes').insert({ codigo, usuario_id: userId, funcion_id: funcionId, total, estado: 'activo' }).select().single()
      if (tErr || !tiquete) throw new Error(tErr?.message || 'Error creando tiquete')
      const detalles = seleccionados.map(asiento_id => ({ tiquete_id: tiquete.id, asiento_id, funcion_id: funcionId, precio_unitario: precio }))
      const { error: dErr } = await supabase.from('detalle_tiquete').insert(detalles)
      if (dErr) { await supabase.from('tiquetes').delete().eq('id', tiquete.id); throw new Error('Uno o más asientos ya fueron tomados.') }
      router.push(`/tiquetes/${tiquete.id}?nuevo=1`)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error al procesar la compra')
      setLoading(false)
    }
  }

  const ocupPct = Math.round((idsOcupados.length / 150) * 100)

  return (
    <div>
      {/* Estadísticas */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        {[
          { label: 'Disponibles', value: 150 - idsOcupados.length, color: '#10b981', bg: '#d1fae5' },
          { label: 'Ocupados', value: idsOcupados.length, color: '#f59e0b', bg: '#fef3c7' },
          { label: 'Ocupación', value: `${ocupPct}%`, color: '#2563eb', bg: '#dbeafe' },
        ].map(s => (
          <div key={s.label} style={{ background: s.bg, borderRadius: 12, padding: '12px 20px', border: `1px solid ${s.color}30` }}>
            <div style={{ fontSize: 22, fontWeight: 900, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 12, color: s.color, fontWeight: 600, marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Pantalla */}
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div style={{ height: 8, maxWidth: 500, margin: '0 auto 10px', background: 'linear-gradient(90deg, transparent, #2563eb, transparent)', borderRadius: 4, opacity: 0.5 }} />
        <p style={{ fontSize: 11, fontWeight: 800, color: '#94a3b8', letterSpacing: '0.3em', textTransform: 'uppercase' }}>PANTALLA</p>
      </div>

      {/* Leyenda */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {[
          { color: '#dbeafe', border: '#2563eb', label: 'Disponible' },
          { color: '#2563eb', border: '#1d4ed8', label: 'Seleccionado' },
          { color: '#f1f5f9', border: '#e2e8f0', label: 'Ocupado' },
        ].map(({ color, border, label }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 22, height: 18, borderRadius: 4, background: color, border: `1.5px solid ${border}` }} />
            <span style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>{label}</span>
          </div>
        ))}
      </div>

      {/* Grid de asientos */}
      <div style={{ overflowX: 'auto', padding: '0.5rem 0 1rem' }}>
        <div style={{ minWidth: 'fit-content', margin: '0 auto' }}>
          {filas.map(fila => {
            const asientosFila = asientos.filter(a => a.fila === fila).sort((a, b) => a.columna - b.columna)
            return (
              <div key={fila} style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 5 }}>
                <span style={{ width: 20, fontSize: 11, fontWeight: 800, color: '#94a3b8', textAlign: 'center', flexShrink: 0 }}>{fila}</span>
                {asientosFila.map(asiento => {
                  const ocupado = ocupadosSet.has(asiento.id)
                  const seleccionado = seleccionados.includes(asiento.id)
                  return (
                    <button key={asiento.id} onClick={() => toggle(asiento.id)} disabled={ocupado}
                      title={`${asiento.fila}${asiento.columna}`}
                      style={{
                        width: 30, height: 24, borderRadius: '5px 5px 3px 3px',
                        border: ocupado ? '1.5px solid #e2e8f0' : seleccionado ? '1.5px solid #1d4ed8' : '1.5px solid #93c5fd',
                        cursor: ocupado ? 'not-allowed' : 'pointer',
                        background: ocupado ? '#f1f5f9' : seleccionado ? '#2563eb' : '#dbeafe',
                        transition: 'all 0.15s',
                        transform: seleccionado ? 'scale(1.15)' : 'scale(1)',
                        flexShrink: 0,
                      }}
                    />
                  )
                })}
              </div>
            )
          })}
        </div>
      </div>

      {/* Panel de compra */}
      <div className="card animate-fade-up" style={{ marginTop: '2rem', padding: '1.75rem', maxWidth: 480, marginLeft: 'auto', marginRight: 'auto' }}>
        <h3 style={{ fontWeight: 800, fontSize: 16, color: '#0a0f1e', marginBottom: '1rem' }}>Resumen de compra</h3>
        {seleccionados.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '1rem 0', color: '#94a3b8', fontSize: 14 }}>
            👆 Selecciona tus asientos en el mapa
          </div>
        ) : (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 14, color: '#64748b' }}>
              <span>{seleccionados.length} asiento{seleccionados.length > 1 ? 's' : ''}</span>
              <span style={{ fontWeight: 600, color: '#374151' }}>${precio.toLocaleString('es-CO')} c/u</span>
            </div>
            <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: 12, marginTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 700, fontSize: 16, color: '#0a0f1e' }}>Total</span>
              <span style={{ fontWeight: 900, fontSize: 24, color: '#2563eb' }}>${total.toLocaleString('es-CO')}</span>
            </div>
          </div>
        )}

        {error && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '10px 14px', color: '#dc2626', fontSize: 13, marginTop: 12 }}>
            ⚠️ {error}
          </div>
        )}

        <button onClick={comprar} disabled={loading || seleccionados.length === 0} className="btn-primary"
          style={{ width: '100%', marginTop: 16, padding: '14px', fontSize: 15, justifyContent: 'center', opacity: (!seleccionados.length || loading) ? 0.5 : 1, cursor: (!seleccionados.length || loading) ? 'not-allowed' : 'pointer' }}>
          {loading ? 'Procesando...' : seleccionados.length ? `Comprar ${seleccionados.length} tiquete${seleccionados.length > 1 ? 's' : ''}` : 'Selecciona asientos'}
        </button>
      </div>
    </div>
  )
}
