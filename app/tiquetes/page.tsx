import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import type { Tiquete } from '@/lib/supabase/types'
import { IconTicket, IconFilm, IconCalendar, IconClock, IconArrowRight, IconChevronRight } from '@/components/icons'

export default async function MisTiquetesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: tiquetes } = await supabase
    .from('tiquetes').select('*, funciones(*, peliculas(*))').eq('usuario_id', user.id).order('fecha_compra', { ascending: false })

  const estadoCfg: Record<string, { label: string; cls: string }> = {
    activo:    { label: 'Activo',    cls: 'badge-blue' },
    usado:     { label: 'Usado',     cls: 'badge-gray' },
    cancelado: { label: 'Cancelado', cls: 'badge-red'  },
  }

  return (
    <div className="page">
      <div className="animate-fade-up" style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <IconTicket size={22} color="#2563eb" />
        </div>
        <div>
          <p className="section-title" style={{ marginBottom: 2 }}>Mi cuenta</p>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: '#0a0f1e', letterSpacing: '-0.02em' }}>Mis Tiquetes</h1>
        </div>
      </div>

      {!tiquetes?.length ? (
        <div className="card animate-fade-up" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
          <div style={{ width: 72, height: 72, borderRadius: 20, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <IconTicket size={32} color="#2563eb" />
          </div>
          <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0a0f1e', marginBottom: 8 }}>Aún no tienes tiquetes</h3>
          <p style={{ color: '#64748b', marginBottom: 20, fontSize: 14 }}>Explora la cartelera y compra tus primeros asientos</p>
          <Link href="/" className="btn-primary" style={{ padding: '11px 24px', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            Ver cartelera <IconArrowRight size={16} color="white" />
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {(tiquetes as Tiquete[]).map((t, i) => {
            const cfg = estadoCfg[t.estado] || { label: t.estado, cls: 'badge-gray' }
            const fecha = t.funciones?.fecha
              ? new Date(t.funciones.fecha + 'T12:00:00').toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' })
              : '—'
            return (
              <Link key={t.id} href={`/tiquetes/${t.id}`} style={{ textDecoration: 'none' }}>
                <div className={`card card-interactive animate-fade-up delay-${Math.min(i + 1, 5)}`}
                  style={{ padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer' }}>
                  <div style={{ width: 48, height: 48, borderRadius: 14, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <IconFilm size={22} color="#2563eb" />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 800, fontSize: 15, color: '#0a0f1e', marginBottom: 5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {t.funciones?.peliculas?.titulo || 'Película'}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 12, color: '#64748b', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <IconCalendar size={12} color="#94a3b8" /> {fecha}
                      </span>
                      <span style={{ fontSize: 12, color: '#64748b', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <IconClock size={12} color="#94a3b8" /> {t.funciones?.hora?.slice(0, 5) || '—'}
                      </span>
                      <code style={{ fontSize: 11, color: '#2563eb', background: '#eff6ff', padding: '2px 7px', borderRadius: 4, fontFamily: 'monospace', fontWeight: 700 }}>
                        {t.codigo}
                      </code>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontWeight: 900, fontSize: 17, color: '#059669', marginBottom: 5 }}>
                      ${Number(t.total).toLocaleString('es-CO')}
                    </div>
                    <span className={`badge ${cfg.cls}`}>{cfg.label}</span>
                  </div>
                  <IconChevronRight size={16} color="#cbd5e1" />
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
