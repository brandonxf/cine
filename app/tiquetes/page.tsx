import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import type { Tiquete } from '@/lib/supabase/types'

export default async function MisTiquetesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: tiquetes } = await supabase
    .from('tiquetes')
    .select('*, funciones(*, peliculas(*))')
    .eq('usuario_id', user.id)
    .order('fecha_compra', { ascending: false })

  const estadoCfg: Record<string, { label: string; cls: string }> = {
    activo:   { label: 'Activo',    cls: 'badge-blue'  },
    usado:    { label: 'Usado',     cls: 'badge-gray'  },
    cancelado:{ label: 'Cancelado', cls: 'badge-red'   },
  }

  return (
    <div className="page">
      {/* Header */}
      <div className="animate-fade-up" style={{ marginBottom: '2rem' }}>
        <p className="section-title">Mi cuenta</p>
        <h1 style={{ fontSize: 32, fontWeight: 900, color: '#0a0f1e', letterSpacing: '-0.02em' }}>Mis Tiquetes</h1>
        <p style={{ color: '#64748b', marginTop: 4, fontSize: 14 }}>Historial de todas tus compras</p>
      </div>

      {!tiquetes?.length ? (
        <div className="card animate-fade-up" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
          <div style={{ width: 72, height: 72, borderRadius: 20, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, margin: '0 auto 16px' }}>🎟️</div>
          <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0a0f1e', marginBottom: 8 }}>Aún no tienes tiquetes</h3>
          <p style={{ color: '#64748b', marginBottom: 20, fontSize: 14 }}>Explora la cartelera y compra tus primeros asientos</p>
          <Link href="/" className="btn-primary" style={{ padding: '11px 24px' }}>Ver cartelera →</Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {(tiquetes as Tiquete[]).map((t, i) => {
            const cfg = estadoCfg[t.estado] || { label: t.estado, cls: 'badge-gray' }
            const fecha = t.funciones?.fecha
              ? new Date(t.funciones.fecha + 'T12:00:00').toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' })
              : '—'
            return (
              <Link key={t.id} href={`/tiquetes/${t.id}`} style={{ textDecoration: 'none' }}>
                <div className={`card card-interactive animate-fade-up delay-${Math.min(i + 1, 5)}`}
                  style={{ padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer' }}>

                  {/* Icono */}
                  <div style={{ width: 48, height: 48, borderRadius: 14, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>
                    🎬
                  </div>

                  {/* Info principal */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 800, fontSize: 15, color: '#0a0f1e', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {t.funciones?.peliculas?.titulo || 'Película'}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>📅 {fecha}</span>
                      <span style={{ fontSize: 12, color: '#94a3b8' }}>·</span>
                      <span style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>🕐 {t.funciones?.hora?.slice(0, 5) || '—'}</span>
                      <span style={{ fontSize: 12, color: '#94a3b8' }}>·</span>
                      <code style={{ fontSize: 11, color: '#2563eb', background: '#eff6ff', padding: '2px 6px', borderRadius: 4, fontFamily: 'monospace', fontWeight: 700 }}>
                        {t.codigo}
                      </code>
                    </div>
                  </div>

                  {/* Right */}
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontWeight: 900, fontSize: 17, color: '#059669', marginBottom: 5 }}>
                      ${Number(t.total).toLocaleString('es-CO')}
                    </div>
                    <span className={`badge ${cfg.cls}`}>{cfg.label}</span>
                  </div>

                  {/* Arrow */}
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="2.5" style={{ flexShrink: 0 }}>
                    <path d="M9 18l6-6-6-6"/>
                  </svg>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
