import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import type { Tiquete, Funcion } from '@/lib/supabase/types'
import { AdminCharts } from '@/components/admin/admin-charts'

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  if (profile?.rol !== 'admin') redirect('/')

  const [
    { count: totalPeliculas },
    { count: totalFunciones },
    { data: tiquetes },
    { data: funciones },
  ] = await Promise.all([
    supabase.from('peliculas').select('*', { count: 'exact', head: true }),
    supabase.from('funciones').select('*', { count: 'exact', head: true }).eq('estado', 'disponible'),
    supabase.from('tiquetes').select('total, estado, fecha_compra'),
    supabase.from('funciones').select('id, fecha, hora, peliculas(titulo), detalle_tiquete(id)').eq('estado', 'disponible').gte('fecha', new Date().toISOString().split('T')[0]).order('fecha').limit(8),
  ])

  const totalVentas = (tiquetes || []).reduce((s: number, t: Tiquete) => s + Number(t.total), 0)
  const tiquetesActivos = (tiquetes || []).filter((t: Tiquete) => t.estado === 'activo').length
  const tiquetesUsados = (tiquetes || []).filter((t: Tiquete) => t.estado === 'usado').length

  // Ventas por dia (ultimos 7 dias)
  const ventasPorDia: Record<string, number> = {}
  const hoy = new Date()
  for (let i = 6; i >= 0; i--) {
    const d = new Date(hoy); d.setDate(hoy.getDate() - i)
    const key = d.toISOString().split('T')[0]
    ventasPorDia[key] = 0
  }
  ;(tiquetes || []).forEach((t: Tiquete) => {
    const dia = t.fecha_compra?.split('T')[0]
    if (dia && ventasPorDia[dia] !== undefined) ventasPorDia[dia] += Number(t.total)
  })

  // Ocupacion por funcion proxima
  const ocupacion = (funciones || []).map((f: Funcion & { peliculas?: { titulo: string }, detalle_tiquete?: { id: string }[] }) => ({
    label: `${f.peliculas?.titulo?.slice(0, 15) || '?'} ${f.hora?.slice(0, 5)}`,
    ocupados: f.detalle_tiquete?.length || 0,
    total: 150,
  }))

  const cards = [
    { title: 'Peliculas activas', value: totalPeliculas || 0, emoji: '🎬', color: '#8b5cf6', href: '/admin/peliculas' },
    { title: 'Funciones activas', value: totalFunciones || 0, emoji: '📅', color: '#3b82f6', href: '/admin/funciones' },
    { title: 'Tiquetes vendidos', value: (tiquetes || []).length, emoji: '🎟️', color: '#f97316', href: '/admin/tiquetes' },
    { title: 'Ingresos totales', value: `$${totalVentas.toLocaleString('es-CO')}`, emoji: '💰', color: '#10b981', href: '/admin/tiquetes' },
  ]

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '2rem 1.5rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>Panel de control</p>
        <h1 style={{ fontSize: 28, fontWeight: 900 }}>Dashboard</h1>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {cards.map(card => (
          <Link key={card.title} href={card.href} style={{ textDecoration: 'none' }}>
            <div style={{ background: '#12121e', borderRadius: 16, padding: '1.5rem', border: '1px solid rgba(255,255,255,0.07)', cursor: 'pointer', transition: 'border-color 0.2s' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: 30, fontWeight: 900, color: card.color }}>{card.value}</div>
                  <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', marginTop: 4 }}>{card.title}</div>
                </div>
                <div style={{ fontSize: 32, opacity: 0.8 }}>{card.emoji}</div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Charts */}
      <AdminCharts ventasPorDia={ventasPorDia} ocupacion={ocupacion} activos={tiquetesActivos} usados={tiquetesUsados} />

      {/* Quick access */}
      <h2 style={{ fontWeight: 700, fontSize: 16, marginBottom: '1rem', marginTop: '2rem' }}>Acceso rapido</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        {[
          { href: '/admin/peliculas', label: 'Gestionar peliculas', emoji: '🎬', desc: 'Agregar, editar o eliminar' },
          { href: '/admin/funciones', label: 'Gestionar funciones', emoji: '📅', desc: 'Programar proyecciones' },
          { href: '/admin/tiquetes', label: 'Ver tiquetes', emoji: '🎟️', desc: 'Consultar todas las ventas' },
          { href: '/validar', label: 'Validar tiquete', emoji: '✅', desc: 'Control de acceso a la sala' },
        ].map(item => (
          <Link key={item.href} href={item.href} style={{ textDecoration: 'none' }}>
            <div style={{ background: '#12121e', borderRadius: 14, padding: '1.25rem', border: '1px solid rgba(255,255,255,0.07)', cursor: 'pointer' }}>
              <div style={{ fontSize: 26, marginBottom: 8 }}>{item.emoji}</div>
              <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{item.label}</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>{item.desc}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
