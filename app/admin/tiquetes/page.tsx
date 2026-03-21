import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import type { Tiquete } from '@/lib/supabase/types'

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

  const estadoBadge: Record<string, { label: string; class: string }> = {
    activo: { label: 'Activo', class: 'badge-blue' },
    usado: { label: 'Usado', class: 'badge-gray' },
    cancelado: { label: 'Cancelado', class: 'badge-red' },
  }

  return (
    <div className="page">
      <div className="animate-fade-up" style={{ marginBottom: '2rem' }}>
        <Link href="/admin" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#64748b', textDecoration: 'none', fontSize: 13, fontWeight: 600, marginBottom: 12 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          Dashboard
        </Link>
        <p className="section-title">Administración</p>
        <h1 style={{ fontSize: 28, fontWeight: 900, color: '#0a0f1e', letterSpacing: '-0.02em' }}>Tiquetes vendidos</h1>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {[
          { label: 'Total ingresos', value: `$${total.toLocaleString('es-CO')}`, color: '#059669', bg: '#d1fae5', icon: '💰' },
          { label: 'Tiquetes activos', value: activos, color: '#2563eb', bg: '#dbeafe', icon: '✅' },
          { label: 'Tiquetes usados', value: usados, color: '#7c3aed', bg: '#ede9fe', icon: '🎭' },
          { label: 'Total vendidos', value: (tiquetes || []).length, color: '#0891b2', bg: '#cffafe', icon: '🎟️' },
        ].map(s => (
          <div key={s.label} className="card animate-fade-up" style={{ padding: '1.25rem' }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, marginBottom: 10 }}>{s.icon}</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600, marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tabla */}
      <div className="card animate-fade-up delay-1" style={{ overflow: 'hidden', padding: 0 }}>
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
              {(tiquetes || []).map((t: Tiquete & { funciones?: { fecha?: string; hora?: string; peliculas?: { titulo?: string } }; profiles?: { nombre?: string; email?: string } }, i: number) => (
                <tr key={t.id} style={{ borderBottom: '1px solid #f8fafc', transition: 'background 0.15s' }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#fafbff'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}>
                  <td style={{ padding: '13px 16px' }}>
                    <code style={{ fontFamily: 'monospace', fontSize: 12, color: '#2563eb', fontWeight: 700, background: '#eff6ff', padding: '3px 8px', borderRadius: 6 }}>{t.codigo}</code>
                  </td>
                  <td style={{ padding: '13px 16px', fontSize: 13, fontWeight: 700, color: '#0a0f1e', maxWidth: 160 }}>
                    <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.funciones?.peliculas?.titulo || '—'}</div>
                  </td>
                  <td style={{ padding: '13px 16px', fontSize: 13, color: '#64748b' }}>
                    {t.funciones?.fecha} {t.funciones?.hora?.slice(0, 5)}
                  </td>
                  <td style={{ padding: '13px 16px', fontSize: 13, color: '#64748b', maxWidth: 140 }}>
                    <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.profiles?.nombre || t.profiles?.email || '—'}</div>
                  </td>
                  <td style={{ padding: '13px 16px', fontSize: 14, fontWeight: 800, color: '#059669' }}>${Number(t.total).toLocaleString('es-CO')}</td>
                  <td style={{ padding: '13px 16px' }}>
                    <span className={`badge ${estadoBadge[t.estado]?.class || 'badge-gray'}`}>{estadoBadge[t.estado]?.label || t.estado}</span>
                  </td>
                  <td style={{ padding: '13px 16px' }}>
                    <Link href={`/tiquetes/${t.id}`} style={{ fontSize: 12, color: '#2563eb', textDecoration: 'none', fontWeight: 700 }}>Ver →</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!(tiquetes || []).length && (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
              <div style={{ fontSize: 36, marginBottom: 8 }}>🎟️</div>
              <p style={{ fontSize: 14 }}>No hay tiquetes vendidos aún</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
