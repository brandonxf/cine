import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  if (profile?.rol !== 'admin') redirect('/')

  const [{ count: totalPeliculas }, { count: totalFunciones }, { data: tiquetes }] = await Promise.all([
    supabase.from('peliculas').select('*', { count: 'exact', head: true }),
    supabase.from('funciones').select('*', { count: 'exact', head: true }).eq('estado', 'disponible'),
    supabase.from('tiquetes').select('total, estado'),
  ])

  const totalVentas = (tiquetes || []).reduce((sum: number, t: { total: number }) => sum + Number(t.total), 0)
  const tiquetesActivos = (tiquetes || []).filter((t: { estado: string }) => t.estado === 'activo').length
  const tiquetesUsados = (tiquetes || []).filter((t: { estado: string }) => t.estado === 'usado').length

  const cards = [
    { title: 'Peliculas activas', value: totalPeliculas || 0, emoji: '🎬', color: '#8b5cf6', href: '/admin/peliculas' },
    { title: 'Funciones disponibles', value: totalFunciones || 0, emoji: '📅', color: '#3b82f6', href: '/admin/funciones' },
    { title: 'Tiquetes vendidos', value: (tiquetes || []).length, emoji: '🎟️', color: '#f97316', href: '/admin/tiquetes' },
    { title: 'Ingresos totales', value: `$${totalVentas.toLocaleString('es-CO')}`, emoji: '💰', color: '#10b981', href: '/admin/tiquetes' },
  ]

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '2rem 1.5rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: 28, fontWeight: 800 }}>Panel Administrativo</h1>
        <p style={{ color: 'rgba(255,255,255,0.5)' }}>Gestion del sistema de cine</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {cards.map(card => (
          <Link key={card.title} href={card.href} style={{ textDecoration: 'none' }}>
            <div style={{ background: '#12121e', borderRadius: 16, padding: '1.5rem', border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer' }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>{card.emoji}</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: card.color }}>{card.value}</div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginTop: 4 }}>{card.title}</div>
            </div>
          </Link>
        ))}
      </div>

      {/* Ocupacion */}
      <div style={{ background: '#12121e', borderRadius: 16, padding: '1.5rem', border: '1px solid rgba(255,255,255,0.08)', marginBottom: '1.5rem' }}>
        <h2 style={{ fontWeight: 700, marginBottom: '1rem' }}>Ocupacion de tiquetes</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', textAlign: 'center' }}>
          {[
            { label: 'Activos', value: tiquetesActivos, color: '#10b981' },
            { label: 'Usados', value: tiquetesUsados, color: '#6b7280' },
            { label: 'Total', value: (tiquetes || []).length, color: '#f97316' },
          ].map(({ label, value, color }) => (
            <div key={label} style={{ padding: '1rem', background: 'rgba(255,255,255,0.04)', borderRadius: 12 }}>
              <div style={{ fontSize: 24, fontWeight: 800, color }}>{value}</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 4 }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Accesos rapidos */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        {[
          { href: '/admin/peliculas', label: 'Gestionar peliculas', emoji: '🎬', desc: 'Agregar, editar o eliminar peliculas' },
          { href: '/admin/funciones', label: 'Gestionar funciones', emoji: '📅', desc: 'Programar nuevas funciones' },
          { href: '/admin/tiquetes', label: 'Ver tiquetes', emoji: '🎟️', desc: 'Consultar todas las ventas' },
          { href: '/validar', label: 'Validar tiquete', emoji: '✅', desc: 'Control de acceso a la sala' },
        ].map(item => (
          <Link key={item.href} href={item.href} style={{ textDecoration: 'none' }}>
            <div style={{ background: '#12121e', borderRadius: 16, padding: '1.5rem', border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer', height: '100%' }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>{item.emoji}</div>
              <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{item.label}</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>{item.desc}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
