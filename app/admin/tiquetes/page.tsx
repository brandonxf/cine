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

  const statusColor: Record<string, string> = { activo: '#10b981', usado: '#6b7280', cancelado: '#ef4444' }

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '2rem 1.5rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <Link href="/admin" style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none', fontSize: 13 }}>← Admin</Link>
        <h1 style={{ fontSize: 26, fontWeight: 800, marginTop: 4 }}>Tiquetes vendidos</h1>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {[
          { label: 'Total ingresos', value: `$${total.toLocaleString('es-CO')}`, color: '#f97316' },
          { label: 'Tiquetes activos', value: activos, color: '#10b981' },
          { label: 'Tiquetes usados', value: usados, color: '#6b7280' },
          { label: 'Total vendidos', value: (tiquetes || []).length, color: '#3b82f6' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ background: '#12121e', borderRadius: 14, padding: '1.25rem', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ fontSize: 22, fontWeight: 800, color }}>{value}</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 4 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Tabla */}
      <div style={{ background: '#12121e', borderRadius: 16, border: '1px solid rgba(255,255,255,0.08)', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 700 }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.04)' }}>
                {['Codigo', 'Pelicula', 'Fecha funcion', 'Usuario', 'Total', 'Estado', 'Ver'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(tiquetes || []).map((t: Tiquete & { funciones?: { fecha?: string; hora?: string; peliculas?: { titulo?: string } }; profiles?: { nombre?: string; email?: string } }, i: number) => (
                <tr key={t.id} style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)' }}>
                  <td style={{ padding: '12px 16px', fontFamily: 'monospace', fontSize: 13, color: '#f97316', fontWeight: 700 }}>{t.codigo}</td>
                  <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 600 }}>{t.funciones?.peliculas?.titulo || '-'}</td>
                  <td style={{ padding: '12px 16px', fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>
                    {t.funciones?.fecha} {t.funciones?.hora?.slice(0,5)}
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>
                    {t.profiles?.nombre || t.profiles?.email || '-'}
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: 14, fontWeight: 700, color: '#f97316' }}>${Number(t.total).toLocaleString('es-CO')}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: statusColor[t.estado] || '#fff', background: `${statusColor[t.estado] || '#fff'}20`, padding: '3px 10px', borderRadius: 6, textTransform: 'uppercase' }}>{t.estado}</span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <Link href={`/tiquetes/${t.id}`} style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', textDecoration: 'none', background: 'rgba(255,255,255,0.06)', padding: '5px 10px', borderRadius: 6 }}>Ver</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!(tiquetes || []).length && (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'rgba(255,255,255,0.4)' }}>
            <div style={{ fontSize: 36, marginBottom: 8 }}>🎟️</div>
            <p>No hay tiquetes vendidos aun</p>
          </div>
        )}
      </div>
    </div>
  )
}
