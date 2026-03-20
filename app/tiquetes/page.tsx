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

  const statusColor: Record<string, string> = {
    activo: '#10b981',
    usado: '#6b7280',
    cancelado: '#ef4444',
  }

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '2rem 1.5rem' }}>
      <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: '0.5rem' }}>Mis Tiquetes</h1>
      <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '2rem' }}>Historial de tus compras</p>

      {!tiquetes?.length ? (
        <div style={{ textAlign: 'center', padding: '4rem', background: '#12121e', borderRadius: 16, border: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🎟️</div>
          <p style={{ color: 'rgba(255,255,255,0.5)' }}>No tienes tiquetes aun</p>
          <Link href="/" style={{ color: '#f97316', fontWeight: 600, textDecoration: 'none', display: 'inline-block', marginTop: 12 }}>Ver cartelera</Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {(tiquetes as Tiquete[]).map(t => (
            <Link key={t.id} href={`/tiquetes/${t.id}`} style={{ textDecoration: 'none' }}>
              <div style={{ background: '#12121e', borderRadius: 16, padding: '1.25rem 1.5rem', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{t.funciones?.peliculas?.titulo || 'Pelicula'}</div>
                  <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>
                    {t.funciones?.fecha} · {t.funciones?.hora?.slice(0,5)} · Codigo: <strong style={{ color: 'rgba(255,255,255,0.8)' }}>{t.codigo}</strong>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 800, fontSize: 16, color: '#f97316' }}>${Number(t.total).toLocaleString('es-CO')}</div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: statusColor[t.estado] || '#fff', background: `${statusColor[t.estado]}20`, padding: '2px 8px', borderRadius: 4, textTransform: 'uppercase' }}>{t.estado}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
