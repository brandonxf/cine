import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import type { Tiquete, Funcion } from '@/lib/supabase/types'
import { AdminCharts } from '@/components/admin/admin-charts'
import { IconFilm, IconCalendar, IconTicket, IconMoney, IconSettings, IconShield, IconPlus, IconArrowRight, IconTrending } from '@/components/icons'

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  if (profile?.rol !== 'admin') redirect('/')

  const [{ count: totalPeliculas }, { count: totalFunciones }, { data: tiquetes }, { data: funciones }] = await Promise.all([
    supabase.from('peliculas').select('*', { count: 'exact', head: true }),
    supabase.from('funciones').select('*', { count: 'exact', head: true }).eq('estado', 'disponible'),
    supabase.from('tiquetes').select('total, estado, fecha_compra'),
    supabase.from('funciones').select('id, fecha, hora, peliculas(titulo), detalle_tiquete(id)').eq('estado', 'disponible').gte('fecha', new Date().toISOString().split('T')[0]).order('fecha').limit(8),
  ])

  const totalVentas = (tiquetes || []).reduce((s: number, t: Tiquete) => s + Number(t.total), 0)
  const tiquetesActivos = (tiquetes || []).filter((t: Tiquete) => t.estado === 'activo').length
  const tiquetesUsados = (tiquetes || []).filter((t: Tiquete) => t.estado === 'usado').length

  const ventasPorDia: Record<string, number> = {}
  const hoy = new Date()
  for (let i = 6; i >= 0; i--) { const d = new Date(hoy); d.setDate(hoy.getDate() - i); ventasPorDia[d.toISOString().split('T')[0]] = 0 }
  ;(tiquetes || []).forEach((t: Tiquete) => { const dia = t.fecha_compra?.split('T')[0]; if (dia && ventasPorDia[dia] !== undefined) ventasPorDia[dia] += Number(t.total) })

  const ocupacion = (funciones || []).map((f: Funcion & { peliculas?: { titulo: string }, detalle_tiquete?: { id: string }[] }) => ({
    label: f.peliculas?.titulo?.slice(0, 20) || '?',
    hora: f.hora?.slice(0, 5) || '',
    ocupados: f.detalle_tiquete?.length || 0,
    total: 150,
  }))

  const stats = [
    { title: 'Películas activas', value: totalPeliculas || 0, icon: <IconFilm size={20} color="#2563eb" />, href: '/admin/peliculas', color: '#2563eb', bg: '#dbeafe', trend: 'Total en cartelera' },
    { title: 'Funciones activas', value: totalFunciones || 0, icon: <IconCalendar size={20} color="#7c3aed" />, href: '/admin/funciones', color: '#7c3aed', bg: '#ede9fe', trend: 'Próximos 7 días' },
    { title: 'Tiquetes vendidos', value: (tiquetes || []).length, icon: <IconTicket size={20} color="#0891b2" />, href: '/admin/tiquetes', color: '#0891b2', bg: '#cffafe', trend: `${tiquetesActivos} activos` },
    { title: 'Ingresos totales', value: `$${totalVentas.toLocaleString('es-CO')}`, icon: <IconMoney size={20} color="#059669" />, href: '/admin/tiquetes', color: '#059669', bg: '#d1fae5', trend: 'COP acumulado' },
  ]

  const accesos = [
    { href: '/admin/peliculas', icon: <IconFilm size={20} color="#2563eb" />, label: 'Películas', desc: 'Agregar, editar o eliminar', bg: '#eff6ff' },
    { href: '/admin/funciones', icon: <IconCalendar size={20} color="#7c3aed" />, label: 'Funciones', desc: 'Programar proyecciones', bg: '#f5f3ff' },
    { href: '/admin/tiquetes', icon: <IconTicket size={20} color="#0891b2" />, label: 'Tiquetes', desc: 'Consultar todas las ventas', bg: '#ecfeff' },
    { href: '/validar', icon: <IconShield size={20} color="#059669" />, label: 'Validar', desc: 'Control de acceso a la sala', bg: '#f0fdf4' },
  ]

  return (
    <div className="page">
      <div className="animate-fade-up" style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <IconTrending size={14} color="#2563eb" />
            <p className="section-title" style={{ margin: 0 }}>Panel de control</p>
          </div>
          <h1 style={{ fontSize: 32, fontWeight: 900, color: '#0a0f1e', letterSpacing: '-0.02em' }}>Dashboard</h1>
          <p style={{ color: '#64748b', marginTop: 4, fontSize: 14 }}>Bienvenido, <strong style={{ color: '#0a0f1e' }}>{profile?.nombre || 'Admin'}</strong></p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Link href="/admin/peliculas" className="btn-ghost" style={{ padding: '9px 18px', fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <IconPlus size={14} color="#475569" /> Nueva película
          </Link>
          <Link href="/admin/funciones" className="btn-primary" style={{ padding: '9px 18px', fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <IconPlus size={14} color="white" /> Nueva función
          </Link>
        </div>
      </div>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {stats.map((s, i) => (
          <Link key={s.title} href={s.href} style={{ textDecoration: 'none' }}>
            <div className={`card card-interactive animate-fade-up delay-${i + 1}`} style={{ padding: '1.5rem', cursor: 'pointer' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {s.icon}
                </div>
                <IconArrowRight size={14} color="#cbd5e1" />
              </div>
              <div style={{ fontSize: 28, fontWeight: 900, color: s.color, letterSpacing: '-0.02em', marginBottom: 4 }}>{s.value}</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#374151', marginBottom: 4 }}>{s.title}</div>
              <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 500 }}>{s.trend}</div>
            </div>
          </Link>
        ))}
      </div>

      <AdminCharts ventasPorDia={ventasPorDia} ocupacion={ocupacion} activos={tiquetesActivos} usados={tiquetesUsados} />

      <div style={{ marginTop: '2rem' }}>
        <h2 className="animate-fade-up" style={{ fontSize: 18, fontWeight: 800, color: '#0a0f1e', marginBottom: '1rem' }}>Acceso rápido</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          {accesos.map((a, i) => (
            <Link key={a.href} href={a.href} style={{ textDecoration: 'none' }}>
              <div className={`card card-interactive animate-fade-up delay-${i + 1}`} style={{ padding: '1.25rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: a.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {a.icon}
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 14, color: '#0a0f1e', marginBottom: 2 }}>{a.label}</div>
                  <div style={{ fontSize: 12, color: '#94a3b8' }}>{a.desc}</div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
