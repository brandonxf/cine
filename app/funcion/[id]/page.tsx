import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { SeatSelector } from '@/components/seat-selector'
import Link from 'next/link'
import Image from 'next/image'
import { IconArrowLeft, IconCalendar, IconClock, IconMoney } from '@/components/icons'

export default async function FuncionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: funcion } = await supabase
    .from('funciones').select('*, peliculas(*)').eq('id', id).single()
  if (!funcion) return notFound()

  const { data: asientos } = await supabase
    .from('asientos').select('*').eq('estado', 'activo').order('numero')

  const { data: ocupados } = await supabase
    .from('detalle_tiquete').select('asiento_id').eq('funcion_id', id)

  const idsOcupados = new Set((ocupados || []).map((d: { asiento_id: string }) => d.asiento_id))
  const fechaStr = new Date(funcion.fecha + 'T12:00:00').toLocaleDateString('es-CO', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  })

  return (
    <div className="page">
      <Link href={`/pelicula/${funcion.pelicula_id}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#64748b', textDecoration: 'none', fontSize: 14, fontWeight: 600, marginBottom: '1.5rem' }}>
        <IconArrowLeft size={15} color="#64748b" /> Volver a la película
      </Link>

      {/* Header */}
      <div className="card animate-fade-up" style={{ padding: '1.25rem 1.5rem', marginBottom: '2rem', display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
        {funcion.peliculas?.imagen_url && (
          <div style={{ position: 'relative', width: 60, height: 86, borderRadius: 10, overflow: 'hidden', flexShrink: 0, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
            <Image src={funcion.peliculas.imagen_url} alt={funcion.peliculas.titulo} fill style={{ objectFit: 'cover' }} unoptimized />
          </div>
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1 style={{ fontSize: 20, fontWeight: 900, color: '#0a0f1e', marginBottom: 8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {funcion.peliculas?.titulo}
          </h1>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 13, color: '#64748b', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5 }}>
              <IconCalendar size={13} color="#94a3b8" /> {fechaStr}
            </span>
            <span style={{ fontSize: 13, color: '#64748b', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5 }}>
              <IconClock size={13} color="#94a3b8" /> {funcion.hora.slice(0, 5)}
            </span>
            <span style={{ fontSize: 13, color: '#059669', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 5 }}>
              <IconMoney size={13} color="#059669" /> ${Number(funcion.precio).toLocaleString('es-CO')} por asiento
            </span>
          </div>
        </div>
      </div>

      <SeatSelector
        asientos={asientos || []}
        idsOcupados={[...idsOcupados]}
        funcionId={id}
        precio={Number(funcion.precio)}
        userId={user.id}
      />
    </div>
  )
}
