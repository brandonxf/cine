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
  return 'TKT-' + Math.random().toString(36).substring(2,6).toUpperCase() + '-' + Date.now().toString(36).toUpperCase()
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
    setSeleccionados(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  const comprar = async () => {
    if (!seleccionados.length) return
    setLoading(true); setError('')
    try {
      const codigo = generarCodigo()
      const { data: tiquete, error: tErr } = await supabase
        .from('tiquetes')
        .insert({ codigo, usuario_id: userId, funcion_id: funcionId, total, estado: 'activo' })
        .select()
        .single()
      if (tErr || !tiquete) throw new Error(tErr?.message || 'Error creando tiquete')

      const detalles = seleccionados.map(asiento_id => ({
        tiquete_id: tiquete.id,
        asiento_id,
        funcion_id: funcionId,
        precio_unitario: precio,
      }))
      const { error: dErr } = await supabase.from('detalle_tiquete').insert(detalles)
      if (dErr) {
        await supabase.from('tiquetes').delete().eq('id', tiquete.id)
        throw new Error('Uno o mas asientos ya fueron tomados. Intenta de nuevo.')
      }
      router.push(`/tiquetes/${tiquete.id}?nuevo=1`)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error al procesar la compra')
      setLoading(false)
    }
  }

  return (
    <div>
      {/* Pantalla */}
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div style={{ background: 'linear-gradient(135deg, rgba(249,115,22,0.3), rgba(249,115,22,0.1))', border: '2px solid rgba(249,115,22,0.4)', borderRadius: '0 0 50% 50% / 0 0 20px 20px', height: 12, maxWidth: 400, margin: '0 auto 8px' }} />
        <p style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.2em', textTransform: 'uppercase' }}>PANTALLA</p>
      </div>

      {/* Leyenda */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {[
          { color: 'rgba(255,255,255,0.12)', label: 'Disponible' },
          { color: '#f97316', label: 'Seleccionado' },
          { color: 'rgba(255,255,255,0.04)', label: 'Ocupado' },
        ].map(({ color, label }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 20, height: 20, borderRadius: 4, background: color, border: label === 'Disponible' ? '1px solid rgba(255,255,255,0.2)' : 'none' }} />
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>{label}</span>
          </div>
        ))}
      </div>

      {/* Grid de asientos */}
      <div style={{ overflowX: 'auto', paddingBottom: 8 }}>
        <div style={{ minWidth: 'fit-content', margin: '0 auto' }}>
          {filas.map(fila => {
            const asientosFila = asientos.filter(a => a.fila === fila).sort((a, b) => a.columna - b.columna)
            return (
              <div key={fila} style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 4 }}>
                <span style={{ width: 20, fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.3)', textAlign: 'center', flexShrink: 0 }}>{fila}</span>
                {asientosFila.map(asiento => {
                  const ocupado = ocupadosSet.has(asiento.id)
                  const seleccionado = seleccionados.includes(asiento.id)
                  return (
                    <button key={asiento.id} onClick={() => toggle(asiento.id)} disabled={ocupado}
                      title={`${asiento.fila}${asiento.columna}`}
                      style={{
                        width: 28, height: 24, borderRadius: '4px 4px 2px 2px', border: 'none',
                        cursor: ocupado ? 'not-allowed' : 'pointer',
                        background: ocupado ? 'rgba(255,255,255,0.04)' : seleccionado ? '#f97316' : 'rgba(255,255,255,0.12)',
                        transition: 'all 0.1s',
                        transform: seleccionado ? 'scale(1.1)' : 'scale(1)',
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
      <div style={{ marginTop: '2rem', background: '#12121e', borderRadius: 16, padding: '1.5rem', border: '1px solid rgba(255,255,255,0.08)', maxWidth: 480, marginLeft: 'auto', marginRight: 'auto' }}>
        <h3 style={{ fontWeight: 700, marginBottom: '1rem', fontSize: 16 }}>Resumen de compra</h3>
        {seleccionados.length === 0 ? (
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, textAlign: 'center', padding: '1rem 0' }}>Selecciona al menos un asiento</p>
        ) : (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14 }}>Asientos ({seleccionados.length})</span>
              <span style={{ fontWeight: 600, fontSize: 14 }}>${precio.toLocaleString('es-CO')} c/u</span>
            </div>
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 12, marginTop: 12, display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontWeight: 700, fontSize: 16 }}>Total</span>
              <span style={{ fontWeight: 800, fontSize: 20, color: '#f97316' }}>${total.toLocaleString('es-CO')}</span>
            </div>
          </div>
        )}

        {error && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, padding: '10px 14px', color: '#ef4444', fontSize: 13, marginTop: 12 }}>{error}</div>}

        <button onClick={comprar} disabled={loading || seleccionados.length === 0}
          style={{
            width: '100%', marginTop: 16, background: seleccionados.length ? '#f97316' : 'rgba(255,255,255,0.08)',
            color: seleccionados.length ? 'white' : 'rgba(255,255,255,0.3)',
            border: 'none', borderRadius: 12, padding: '14px', fontSize: 15, fontWeight: 700,
            cursor: seleccionados.length && !loading ? 'pointer' : 'not-allowed',
          }}>
          {loading ? 'Procesando...' : seleccionados.length ? `Comprar ${seleccionados.length} tiquete${seleccionados.length > 1 ? 's' : ''}` : 'Selecciona asientos'}
        </button>
      </div>
    </div>
  )
}
