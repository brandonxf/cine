'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { IconShield, IconCheck, IconX, IconWarning, IconQr, IconFilm, IconCalendar, IconClock, IconMoney } from '@/components/icons'

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

  const cfg = {
    idle:    { icon: null, title: '', bg: '', border: '', color: '' },
    valido:  { icon: <IconCheck size={28} color="#15803d" />, title: 'ACCESO PERMITIDO',       bg: '#f0fdf4', border: '#bbf7d0', color: '#15803d' },
    usado:   { icon: <IconWarning size={28} color="#b45309" />, title: 'TIQUETE YA UTILIZADO', bg: '#fffbeb', border: '#fde68a', color: '#b45309' },
    invalido:{ icon: <IconX size={28} color="#dc2626" />, title: 'TIQUETE INVÁLIDO',           bg: '#fef2f2', border: '#fecaca', color: '#dc2626' },
  }[estado]

  return (
    <div className="hero-bg" style={{ minHeight: '85vh', padding: '3rem 1.5rem', display: 'flex', alignItems: 'center' }}>
      <div style={{ maxWidth: 520, margin: '0 auto', width: '100%' }}>

        <div className="animate-fade-up" style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ width: 64, height: 64, borderRadius: 20, background: 'linear-gradient(135deg, #2563eb, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', boxShadow: '0 8px 24px rgba(37,99,235,0.3)' }}>
            <IconShield size={30} color="white" />
          </div>
          <h1 style={{ fontFamily: 'DM Serif Display, serif', fontSize: 32, fontWeight: 400, color: '#0a0f1e', marginBottom: 8 }}>Validar Tiquete</h1>
          <p style={{ color: '#64748b' }}>Ingresa el código para validar el acceso a la sala</p>
        </div>

        <div className="animate-fade-up delay-1 card" style={{ padding: '2rem' }}>
          <form onSubmit={validar} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }}>
                <IconQr size={18} color="#94a3b8" />
              </div>
              <input
                value={codigo} onChange={e => setCodigo(e.target.value.toUpperCase())}
                placeholder="TKT-XXXX-XXXX" required
                style={{ padding: '15px 16px 15px 44px', border: '2px solid #e2e8f0', borderRadius: 12, color: '#0a0f1e', fontSize: 18, fontFamily: 'monospace', textAlign: 'center', outline: 'none', transition: 'border-color 0.2s', width: '100%', boxSizing: 'border-box', letterSpacing: '0.08em' }}
                onFocus={e => (e.target as HTMLElement).style.borderColor = '#2563eb'}
                onBlur={e => (e.target as HTMLElement).style.borderColor = '#e2e8f0'}
              />
            </div>
            <button type="submit" disabled={loading || !codigo} className="btn-primary"
              style={{ padding: '14px', fontSize: 16, justifyContent: 'center', opacity: (!codigo || loading) ? 0.6 : 1, display: 'flex', alignItems: 'center', gap: 8 }}>
              <IconShield size={18} color="white" />
              {loading ? 'Validando...' : 'Validar código'}
            </button>
          </form>

          {estado !== 'idle' && (
            <div className="animate-fade-up" style={{ marginTop: '1.5rem', background: cfg.bg, border: `1.5px solid ${cfg.border}`, borderRadius: 16, padding: '1.5rem', textAlign: 'center' }}>
              <div style={{ width: 56, height: 56, borderRadius: 16, background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                {cfg.icon}
              </div>
              <div style={{ fontWeight: 900, fontSize: 15, color: cfg.color, marginBottom: 12, letterSpacing: '0.05em' }}>
                {cfg.title}
              </div>
              {info && (
                <div style={{ background: 'white', borderRadius: 12, padding: '1rem', textAlign: 'left' }}>
                  {[
                    { icon: <IconFilm size={13} color="#2563eb" />, label: 'Película', value: (info as { funciones?: { peliculas?: { titulo?: string } } }).funciones?.peliculas?.titulo },
                    { icon: <IconCalendar size={13} color="#2563eb" />, label: 'Fecha', value: (info as { funciones?: { fecha?: string } }).funciones?.fecha },
                    { icon: <IconClock size={13} color="#2563eb" />, label: 'Hora', value: (info as { funciones?: { hora?: string } }).funciones?.hora?.toString().slice(0, 5) },
                    { icon: <IconMoney size={13} color="#059669" />, label: 'Total', value: `$${Number(info.total).toLocaleString('es-CO')}` },
                  ].map(({ icon, label, value }) => (
                    <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 0', borderBottom: '1px solid #f1f5f9', fontSize: 13 }}>
                      <span style={{ color: '#64748b', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>{icon} {label}</span>
                      <span style={{ fontWeight: 800, color: '#0a0f1e' }}>{value}</span>
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
