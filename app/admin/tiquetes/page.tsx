import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import type { Tiquete } from '@/lib/supabase/types'
import { IconTicket, IconMoney, IconArrowLeft, IconArrowRight } from '@/components/icons'

export default async function AdminTiquetesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  if (profile?.rol !== 'admin') redirect('/')

  const { data: tiquetes } = await supabase
    .from('tiquetes')
    .select('*, funciones(fecha, hora, peliculas(titulo)), profiles(nombre, email)')
    .order('fecha_compra', { ascending: false })

  const total = (tiquetes || []).reduce((s: number, t: Tiquete) => s + Number(t.total), 0)
  const activos = (tiquetes || []).filter((t: Tiquete) => t.estado === 'activo').length
  const usados = (tiquetes || []).filter((t: Tiquete) => t.estado === 'usado').length

  const estadoCfg: Record<string, { label: string; cls: string }> = {
    activo:    { label: 'Activo',    cls: 'badge-blue' },
    usado:     { label: 'Usado',     cls: 'badge-gray' },
    cancelado: { label: 'Cancelado', cls: 'badge-red'  },
  }

  return (
    <div className="page">
      {/* Header */}
      <div className="animate-fade-up" style={{ marginBottom: '2rem' }}>
        <Link href="/admin" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#64748b', textDecoration: 'none', fontSize: 13, fontWeight: 600, marginBottom: 12 }}>
          <IconArrowLeft size={14} color="#64748b" /> Dashboard
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: '#ecfeff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <IconTicket size={20} color="#0891b2" />
          </div>
          <div>
            <p className="section-title" style={{ marginBottom: 2 }}>Administración</p>
            <h1 style={{ fontSize: 26, fontWeight: 900, color: '#0a0f1e', letterSpacing: '-0.02em' }}>Tiquetes vendidos</h1>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {[
          { label: 'Total ingresos', value: `$${total.toLocaleString('es-CO')}`, color: '#059669', bg: '#d1fae5', icon: <IconMoney size={18} color="#059669" /> },
          { label: 'Tiquetes activos', value: activos, color: '#2563eb', bg: '#dbeafe', icon: <IconTicket size={18} color="#2563eb" /> },
          { label: 'Tiquetes usados', value: usados, color: '#7c3aed', bg: '#ede9fe', icon: <IconTicket size={18} color="#7c3aed" /> },
          { label: 'Total vendidos', value: (tiquetes || []).length, color: '#0891b2', bg: '#cffafe', icon: <IconTicket size={18} color="#0891b2" /> },
        ].map(s => (
          <div key={s.label} className="card animate-fade-up" style={{ padding: '1.25rem' }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>{s.icon}</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600, marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Mobile: cards */}
      <div className="mobile-table card animate-fade-up" style={{ overflow: 'hidden', padding: 0 }}>
        <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: 15, fontWeight: 800, color: '#0a0f1e' }}>Historial</h2>
          <span className="badge badge-blue">{(tiquetes || []).length}</span>
        </div>
        {(tiquetes || []).map((t: Tiquete & { funciones?: { fecha?: string; hora?: string; peliculas?: { titulo?: string } }; profiles?: { nombre?: string; email?: string } }) => (
          <Link key={t.id} href={`/tiquetes/${t.id}`} style={{ textDecoration: 'none' }}>
            <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #f8fafc', display: 'flex', gap: 12, alignItems: 'center' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 800, fontSize: 14, color: '#0a0f1e', marginBottom: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {t.funciones?.peliculas?.titulo || '—'}
                </div>
                <code style={{ fontSize: 11, color: '#2563eb', background: '#eff6ff', padding: '2px 6px', borderRadius: 4 }}>{t.codigo}</code>
                <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 3 }}>{t.profiles?.nombre || t.profiles?.email || '—'}</div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontWeight: 900, fontSize: 15, color: '#059669', marginBottom: 4 }}>${Number(t.total).toLocaleString('es-CO')}</div>
                <span className={`badge ${estadoCfg[t.estado]?.cls || 'badge-gray'}`} style={{ fontSize: 10 }}>{estadoCfg[t.estado]?.label || t.estado}</span>
              </div>
              <IconArrowRight size={14} color="#cbd5e1" />
            </div>
          </Link>
        ))}
      </div>

      {/* Desktop: tabla */}
      <div className="desktop-table card animate-fade-up" style={{ overflow: 'hidden', padding: 0 }}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: 15, fontWeight: 800, color: '#0a0f1e' }}>Historial de ventas</h2>
          <span className="badge badge-blue">{(tiquetes || []).length} registros</span>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 700 }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                {['Código', 'Película', 'Función', 'Usuario', 'Total', 'Estado', ''].map(h => (
                  <th key={h} style={{ padding: '11px 16px', textAlign: 'left', fontSize: 11, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', borderBottom: '1px solid #f1f5f9' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(tiquetes || []).map((t: Tiquete & { funciones?: { fecha?: string; hora?: string; peliculas?: { titulo?: string } }; profiles?: { nombre?: string; email?: string } }) => (
                <tr key={t.id} style={{ borderBottom: '1px solid #f8fafc', transition: 'background 0.15s' }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#fafbff'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}>
                  <td style={{ padding: '13px 16px' }}>
                    <code style={{ fontFamily: 'monospace', fontSize: 12, color: '#2563eb', fontWeight: 700, background: '#eff6ff', padding: '3px 8px', borderRadius: 6 }}>{t.codigo}</code>
                  </td>
                  <td style={{ padding: '13px 16px', fontSize: 13, fontWeight: 700, color: '#0a0f1e', maxWidth: 160 }}>
                    <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.funciones?.peliculas?.titulo || '—'}</div>
                  </td>
                  <td style={{ padding: '13px 16px', fontSize: 13, color: '#64748b' }}>{t.funciones?.fecha} {t.funciones?.hora?.slice(0, 5)}</td>
                  <td style={{ padding: '13px 16px', fontSize: 13, color: '#64748b', maxWidth: 140 }}>
                    <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.profiles?.nombre || t.profiles?.email || '—'}</div>
                  </td>
                  <td style={{ padding: '13px 16px', fontSize: 14, fontWeight: 800, color: '#059669' }}>${Number(t.total).toLocaleString('es-CO')}</td>
                  <td style={{ padding: '13px 16px' }}>
                    <span className={`badge ${estadoCfg[t.estado]?.cls || 'badge-gray'}`}>{estadoCfg[t.estado]?.label || t.estado}</span>
                  </td>
                  <td style={{ padding: '13px 16px' }}>
                    <Link href={`/tiquetes/${t.id}`} style={{ fontSize: 12, color: '#2563eb', textDecoration: 'none', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      Ver <IconArrowRight size={12} color="#2563eb" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!(tiquetes || []).length && (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
            <IconTicket size={32} color="#e2e8f0" style={{ margin: '0 auto 12px', display: 'block' }} />
            <p style={{ fontSize: 14 }}>No hay tiquetes vendidos aún</p>
          </div>
        )}
      </div>

      <style>{`
        .mobile-table { display: none; }
        .desktop-table { display: block; }
        @media (max-width: 640px) {
          .mobile-table { display: block; }
          .desktop-table { display: none; }
        }
      `}</style>
    </div>
  )
}
