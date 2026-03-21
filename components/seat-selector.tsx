'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import type { Asiento } from '@/lib/supabase/types'
import { IconTicket, IconSeat, IconCheck } from './icons'
import { SeatIcon } from './seat-icon'

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
  const ocupPct = Math.round((idsOcupados.length / 150) * 100)

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
      if (dErr) { await supabase.from('tiquetes').delete().eq('id', tiquete.id); throw new Error('Uno o más asientos ya fueron tomados. Intenta de nuevo.') }
      router.push(`/tiquetes/${tiquete.id}?nuevo=1`)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error al procesar la compra')
      setLoading(false)
    }
  }

  return (
    <div>
      {/* Stats */}
      <div className="animate-fade-up" style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        {[
          { icon: <IconSeat size={16} color="#059669" />, label: 'Disponibles', value: 150 - idsOcupados.length, color: '#059669', bg: '#d1fae5', border: '#a7f3d0' },
          { icon: <IconSeat size={16} color="#f59e0b" />, label: 'Ocupados',    value: idsOcupados.length,        color: '#d97706', bg: '#fef3c7', border: '#fde68a' },
          { icon: <IconTicket size={16} color="#2563eb" />, label: 'Ocupación', value: `${ocupPct}%`,             color: '#2563eb', bg: '#dbeafe', border: '#bfdbfe' },
        ].map(s => (
          <div key={s.label} style={{ background: s.bg, borderRadius: 12, padding: '12px 20px', border: `1.5px solid ${s.border}`, display: 'flex', alignItems: 'center', gap: 10 }}>
            {s.icon}
            <div>
              <div style={{ fontSize: 22, fontWeight: 900, color: s.color, lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: 11, color: s.color, fontWeight: 700, marginTop: 2, opacity: 0.8 }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Sala */}
      <div className="card animate-fade-up delay-1" style={{ padding: '2rem 1.5rem', marginBottom: '1.5rem' }}>

        {/* Pantalla */}
        <div style={{ marginBottom: '2.5rem', textAlign: 'center' }}>
          <div style={{ maxWidth: 500, margin: '0 auto 6px', height: 8, borderRadius: '0 0 50% 50%', background: 'linear-gradient(90deg, transparent, #2563eb 25%, #3b82f6 50%, #2563eb 75%, transparent)', opacity: 0.7 }} />
          <div style={{ maxWidth: 540, margin: '0 auto 10px', height: 2, background: 'linear-gradient(90deg, transparent, #bfdbfe, transparent)' }} />
          <span style={{ fontSize: 10, fontWeight: 800, color: '#94a3b8', letterSpacing: '0.4em', textTransform: 'uppercase' }}>PANTALLA</span>
        </div>

        {/* Leyenda */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginBottom: '2rem', flexWrap: 'wrap' }}>
          {[
            { state: 'available' as const, label: 'Disponible' },
            { state: 'selected'  as const, label: 'Seleccionado' },
            { state: 'occupied'  as const, label: 'Ocupado' },
          ].map(({ state, label }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <SeatIcon state={state} size={20} />
              <span style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>{label}</span>
            </div>
          ))}
        </div>

        {/* Grid de asientos */}
        <div style={{ overflowX: 'auto', paddingBottom: 8 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'center', width: 'fit-content', margin: '0 auto' }}>
            {filas.map(fila => {
              const asientosFila = asientos.filter(a => a.fila === fila).sort((a, b) => a.columna - b.columna)
              return (
                <div key={fila} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  {/* Label izq */}
                  <span style={{ width: 20, fontSize: 11, fontWeight: 800, color: '#94a3b8', textAlign: 'center', flexShrink: 0, userSelect: 'none' }}>{fila}</span>
                  {/* Asientos */}
                  <div style={{ display: 'flex', gap: 3 }}>
                    {asientosFila.map(asiento => {
                      const ocupado = ocupadosSet.has(asiento.id)
                      const sel = seleccionados.includes(asiento.id)
                      const state = ocupado ? 'occupied' : sel ? 'selected' : 'available'
                      return (
                        <button
                          key={asiento.id}
                          onClick={() => toggle(asiento.id)}
                          disabled={ocupado}
                          title={`Fila ${asiento.fila} — Asiento ${asiento.columna}`}
                          style={{
                            background: 'none', border: 'none', padding: 0,
                            cursor: ocupado ? 'not-allowed' : 'pointer',
                            transition: 'transform 0.12s',
                            transform: sel ? 'scale(1.15) translateY(-2px)' : 'scale(1)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            outline: 'none',
                          }}
                        >
                          <SeatIcon state={state} size={26} />
                        </button>
                      )
                    })}
                  </div>
                  {/* Label der */}
                  <span style={{ width: 20, fontSize: 11, fontWeight: 800, color: '#94a3b8', textAlign: 'center', flexShrink: 0, userSelect: 'none' }}>{fila}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Resumen */}
      <div className="card animate-fade-up delay-2" style={{ padding: '1.75rem', maxWidth: 480, margin: '0 auto' }}>
        <h3 style={{ fontWeight: 900, fontSize: 16, color: '#0a0f1e', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: 8 }}>
          <IconTicket size={18} color="#2563eb" /> Resumen de compra
        </h3>

        {seleccionados.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '1.5rem 0', color: '#94a3b8' }}>
            <div style={{ margin: '0 auto 12px', width: 'fit-content' }}>
              <SeatIcon state="available" size={32} />
            </div>
            <p style={{ fontSize: 14, fontWeight: 500 }}>Selecciona tus asientos en el mapa</p>
          </div>
        ) : (
          <div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
              {seleccionados.map(id => {
                const a = asientos.find(x => x.id === id)
                return a ? (
                  <span key={id} style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 6, padding: '3px 9px', fontSize: 12, fontWeight: 800, color: '#2563eb' }}>
                    {a.fila}{a.columna}
                  </span>
                ) : null
              })}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: '#64748b', marginBottom: 8 }}>
              <span>{seleccionados.length} asiento{seleccionados.length > 1 ? 's' : ''}</span>
              <span style={{ fontWeight: 600, color: '#374151' }}>${precio.toLocaleString('es-CO')} c/u</span>
            </div>
            <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 700, fontSize: 16, color: '#0a0f1e' }}>Total</span>
              <span style={{ fontWeight: 900, fontSize: 26, color: '#2563eb' }}>${total.toLocaleString('es-CO')}</span>
            </div>
          </div>
        )}

        {error && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '10px 14px', color: '#dc2626', fontSize: 13, marginTop: 12 }}>
            ⚠️ {error}
          </div>
        )}

        <button onClick={comprar} disabled={loading || seleccionados.length === 0} className="btn-primary"
          style={{ width: '100%', marginTop: 16, padding: '14px', fontSize: 15, justifyContent: 'center', display: 'flex', alignItems: 'center', gap: 8, opacity: (!seleccionados.length || loading) ? 0.45 : 1, cursor: (!seleccionados.length || loading) ? 'not-allowed' : 'pointer' }}>
          {loading ? 'Procesando...' : seleccionados.length
            ? <><IconCheck size={16} color="white" /> Comprar {seleccionados.length} tiquete{seleccionados.length > 1 ? 's' : ''} — ${total.toLocaleString('es-CO')}</>
            : <><IconSeat size={16} color="white" style={{ opacity: 0.5 }} /> Selecciona asientos</>
          }
        </button>
      </div>
    </div>
  )
}
