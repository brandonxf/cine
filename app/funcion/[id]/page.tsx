import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { SeatSelector } from '@/components/seat-selector'
import Link from 'next/link'
import Image from 'next/image'

export default async function FuncionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: funcion } = await supabase
    .from('funciones')
    .select('*, peliculas(*)')
    .eq('id', id)
    .single()

  if (!funcion) return notFound()

  const { data: asientos } = await supabase
    .from('asientos')
    .select('*')
    .eq('estado', 'activo')
    .order('numero')

  const { data: ocupados } = await supabase
    .from('detalle_tiquete')
    .select('asiento_id')
    .eq('funcion_id', id)

  const idsOcupados = new Set((ocupados || []).map((d: { asiento_id: string }) => d.asiento_id))
  const fecha = new Date(funcion.fecha + 'T12:00:00')
  const fechaStr = fecha.toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '2rem 1.5rem' }}>
      <Link href={`/pelicula/${funcion.pelicula_id}`} style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none', fontSize: 14, display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: '1.5rem' }}>
        ← Volver a la pelicula
      </Link>

      {/* Header */}
      <div style={{ background: '#12121e', borderRadius: 16, padding: '1.5rem', marginBottom: '2rem', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
        {funcion.peliculas?.imagen_url && (
          <div style={{ position: 'relative', width: 70, height: 100, borderRadius: 8, overflow: 'hidden', flexShrink: 0 }}>
            <Image src={funcion.peliculas.imagen_url} alt={funcion.peliculas.titulo} fill style={{ objectFit: 'cover' }} unoptimized />
          </div>
        )}
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>{funcion.peliculas?.titulo}</h1>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14 }}>📅 {fechaStr}</span>
            <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14 }}>🕐 {funcion.hora.slice(0,5)}</span>
            <span style={{ color: '#f97316', fontWeight: 700, fontSize: 14 }}>💰 ${Number(funcion.precio).toLocaleString('es-CO')} por asiento</span>
          </div>
        </div>
      </div>

      {/* Seat selector */}
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
