'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type Estado = 'idle' | 'valido' | 'usado' | 'invalido'

export default function ValidarPage() {
  const [codigo, setCodigo] = useState('')
  const [estado, setEstado] = useState<Estado>('idle')
  const [info, setInfo] = useState<Record<string, unknown> | null>(null)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const validar = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setEstado('idle'); setInfo(null)

    const { data: tiquete } = await supabase
      .from('tiquetes')
      .select('*, funciones(*, peliculas(*))')
      .eq('codigo', codigo.trim().toUpperCase())
      .single()

    if (!tiquete) { setEstado('invalido'); setLoading(false); return }

    if (tiquete.estado === 'usado') { setEstado('usado'); setInfo(tiquete); setLoading(false); return }

    if (tiquete.estado === 'activo') {
      await supabase.from('tiquetes').update({ estado: 'usado' }).eq('id', tiquete.id)
      setEstado('valido'); setInfo(tiquete)
    } else {
      setEstado('invalido'); setInfo(tiquete)
    }
    setLoading(false)
  }

  const config: Record<Estado, { emoji: string, title: string, bg: string, color: string }> = {
    idle: { emoji: '🎟️', title: '', bg: '', color: '' },
    valido: { emoji: '✅', title: 'TIQUETE VALIDO - ACCESO PERMITIDO', bg: 'rgba(16,185,129,0.1)', color: '#10b981' },
    usado: { emoji: '⚠️', title: 'TIQUETE YA UTILIZADO', bg: 'rgba(245,158,11,0.1)', color: '#f59e0b' },
    invalido: { emoji: '❌', title: 'TIQUETE INVALIDO', bg: 'rgba(239,68,68,0.1)', color: '#ef4444' },
  }

  return (
    <div style={{ maxWidth: 520, margin: '0 auto', padding: '2rem 1.5rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div style={{ fontSize: 48, marginBottom: 8 }}>🎭</div>
        <h1 style={{ fontSize: 26, fontWeight: 800 }}>Validar Tiquete</h1>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, marginTop: 4 }}>Ingresa el codigo del tiquete para validar el acceso</p>
      </div>

      <div style={{ background: '#12121e', borderRadius: 20, padding: '2rem', border: '1px solid rgba(255,255,255,0.08)' }}>
        <form onSubmit={validar} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <input
            value={codigo}
            onChange={e => setCodigo(e.target.value.toUpperCase())}
            placeholder="TKT-XXXX-XXXX"
            required
            style={{ padding: '16px', background: 'rgba(255,255,255,0.05)', border: '2px solid rgba(255,255,255,0.1)', borderRadius: 12, color: 'white', fontSize: 18, fontFamily: 'monospace', textAlign: 'center', letterSpacing: '0.1em', outline: 'none', boxSizing: 'border-box', width: '100%' }}
          />
          <button type="submit" disabled={loading || !codigo}
            style={{ background: '#f97316', color: 'white', border: 'none', borderRadius: 12, padding: '14px', fontSize: 16, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Validando...' : 'Validar codigo'}
          </button>
        </form>

        {estado !== 'idle' && (
          <div style={{ marginTop: '1.5rem', background: config[estado].bg, border: `1px solid ${config[estado].color}40`, borderRadius: 16, padding: '1.5rem', textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 8 }}>{config[estado].emoji}</div>
            <div style={{ fontWeight: 800, fontSize: 16, color: config[estado].color, marginBottom: 12 }}>{config[estado].title}</div>

            {info && (
              <div style={{ textAlign: 'left', background: 'rgba(0,0,0,0.3)', borderRadius: 10, padding: '1rem' }}>
                {[
                  { label: 'Pelicula', value: (info as { funciones?: { peliculas?: { titulo?: string } } }).funciones?.peliculas?.titulo },
                  { label: 'Fecha', value: (info as { funciones?: { fecha?: string } }).funciones?.fecha },
                  { label: 'Hora', value: (info as { funciones?: { hora?: string } }).funciones?.hora?.toString().slice(0,5) },
                  { label: 'Codigo', value: info.codigo as string },
                  { label: 'Total', value: `$${Number(info.total).toLocaleString('es-CO')}` },
                ].map(({ label, value }) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: 13 }}>
                    <span style={{ color: 'rgba(255,255,255,0.5)' }}>{label}</span>
                    <span style={{ fontWeight: 600 }}>{value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
