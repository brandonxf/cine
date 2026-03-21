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
      .from('tiquetes').select('*, funciones(*, peliculas(*))').eq('codigo', codigo.trim().toUpperCase()).single()
    if (!tiquete) { setEstado('invalido'); setLoading(false); return }
    if (tiquete.estado === 'usado') { setEstado('usado'); setInfo(tiquete); setLoading(false); return }
    if (tiquete.estado === 'activo') {
      await supabase.from('tiquetes').update({ estado: 'usado' }).eq('id', tiquete.id)
      setEstado('valido'); setInfo(tiquete)
    } else { setEstado('invalido'); setInfo(tiquete) }
    setLoading(false)
  }

  const cfg: Record<Estado, { emoji: string; title: string; bg: string; border: string; color: string }> = {
    idle: { emoji: '', title: '', bg: '', border: '', color: '' },
    valido: { emoji: '✅', title: 'ACCESO PERMITIDO', bg: '#f0fdf4', border: '#bbf7d0', color: '#15803d' },
    usado: { emoji: '⚠️', title: 'TIQUETE YA UTILIZADO', bg: '#fffbeb', border: '#fde68a', color: '#b45309' },
    invalido: { emoji: '❌', title: 'TIQUETE INVÁLIDO', bg: '#fef2f2', border: '#fecaca', color: '#dc2626' },
  }

  return (
    <div className="hero-bg" style={{ minHeight: '85vh', padding: '3rem 1.5rem', display: 'flex', alignItems: 'center' }}>
      <div style={{ maxWidth: 520, margin: '0 auto', width: '100%' }}>
        <div className="animate-fade-up" style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🎭</div>
          <h1 style={{ fontFamily: 'DM Serif Display, serif', fontSize: 32, fontWeight: 400, color: '#0a0f1e', marginBottom: 8 }}>Validar Tiquete</h1>
          <p style={{ color: '#64748b' }}>Ingresa el código para validar el acceso a la sala</p>
        </div>

        <div className="animate-fade-up delay-1 card" style={{ padding: '2rem' }}>
          <form onSubmit={validar} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <input
              value={codigo} onChange={e => setCodigo(e.target.value.toUpperCase())}
              placeholder="TKT-XXXX-XXXX" required
              style={{
                padding: '16px', border: '2px solid #e2e8f0', borderRadius: 12,
                color: '#0a0f1e', fontSize: 20, fontFamily: 'monospace',
                textAlign: 'center', letterSpacing: '0.1em', outline: 'none',
                transition: 'border-color 0.2s', width: '100%', boxSizing: 'border-box',
              }}
              onFocus={e => (e.target as HTMLElement).style.borderColor = '#2563eb'}
              onBlur={e => (e.target as HTMLElement).style.borderColor = '#e2e8f0'}
            />
            <button type="submit" disabled={loading || !codigo} className="btn-primary"
              style={{ padding: '14px', fontSize: 16, justifyContent: 'center', opacity: (!codigo || loading) ? 0.6 : 1 }}>
              {loading ? 'Validando...' : 'Validar código'}
            </button>
          </form>

          {estado !== 'idle' && (
            <div className="animate-fade-up" style={{
              marginTop: '1.5rem', background: cfg[estado].bg,
              border: `1.5px solid ${cfg[estado].border}`,
              borderRadius: 16, padding: '1.5rem', textAlign: 'center',
            }}>
              <div style={{ fontSize: 48, marginBottom: 8 }}>{cfg[estado].emoji}</div>
              <div style={{ fontWeight: 900, fontSize: 16, color: cfg[estado].color, marginBottom: 12, letterSpacing: '0.05em' }}>
                {cfg[estado].title}
              </div>
              {info && (
                <div style={{ background: 'white', borderRadius: 10, padding: '1rem', textAlign: 'left' }}>
                  {[
                    { label: 'Película', value: (info as { funciones?: { peliculas?: { titulo?: string } } }).funciones?.peliculas?.titulo },
                    { label: 'Fecha', value: (info as { funciones?: { fecha?: string } }).funciones?.fecha },
                    { label: 'Hora', value: (info as { funciones?: { hora?: string } }).funciones?.hora?.toString().slice(0, 5) },
                    { label: 'Código', value: info.codigo as string },
                    { label: 'Total', value: `$${Number(info.total).toLocaleString('es-CO')}` },
                  ].map(({ label, value }) => (
                    <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid #f1f5f9', fontSize: 13 }}>
                      <span style={{ color: '#64748b', fontWeight: 600 }}>{label}</span>
                      <span style={{ fontWeight: 700, color: '#0a0f1e' }}>{value}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
