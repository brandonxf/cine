import { createClient } from '@/lib/supabase/server'
import type { Funcion, Pelicula } from '@/lib/supabase/types'
import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'

export default async function PeliculaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: pelicula } = await supabase.from('peliculas').select('*').eq('id', id).single()
  if (!pelicula) return notFound()

  const hoy = new Date().toISOString().split('T')[0]
  const { data: funciones } = await supabase
    .from('funciones')
    .select('*')
    .eq('pelicula_id', id)
    .eq('estado', 'disponible')
    .gte('fecha', hoy)
    .order('fecha')
    .order('hora')

  const diasUnicos = [...new Set((funciones || []).map((f: Funcion) => f.fecha))]

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '2rem 1.5rem' }}>
      <Link href="/" style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none', fontSize: 14, display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: '1.5rem' }}>
        ← Volver a cartelera
      </Link>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(200px, 300px) 1fr', gap: '2.5rem', alignItems: 'start' }}>
        {/* Poster */}
        <div style={{ borderRadius: 16, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ position: 'relative', aspectRatio: '2/3' }}>
            {(pelicula as Pelicula).imagen_url ? (
              <Image src={(pelicula as Pelicula).imagen_url} alt={(pelicula as Pelicula).titulo} fill style={{ objectFit: 'cover' }} unoptimized />
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: 64, background: '#1a1a2e' }}>🎬</div>
            )}
          </div>
        </div>

        {/* Info */}
        <div>
          <div style={{ display: 'flex', gap: 8, marginBottom: '1rem', flexWrap: 'wrap' }}>
            <span style={{ background: 'rgba(249,115,22,0.15)', border: '1px solid rgba(249,115,22,0.3)', color: '#f97316', padding: '4px 12px', borderRadius: 6, fontSize: 13, fontWeight: 700 }}>{(pelicula as Pelicula).clasificacion}</span>
            <span style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.7)', padding: '4px 12px', borderRadius: 6, fontSize: 13 }}>{(pelicula as Pelicula).genero}</span>
            <span style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.7)', padding: '4px 12px', borderRadius: 6, fontSize: 13 }}>{(pelicula as Pelicula).duracion} min</span>
          </div>
          <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 900, lineHeight: 1.1, marginBottom: '1rem' }}>{(pelicula as Pelicula).titulo}</h1>
          <p style={{ color: 'rgba(255,255,255,0.6)', lineHeight: 1.7, marginBottom: '2rem', fontSize: 15 }}>{(pelicula as Pelicula).descripcion}</p>

          {/* Funciones */}
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: '1.25rem' }}>Funciones disponibles</h2>
          {!funciones?.length ? (
            <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 12, padding: '2rem', textAlign: 'center', color: 'rgba(255,255,255,0.4)' }}>
              No hay funciones disponibles por el momento
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {diasUnicos.map(dia => {
                const fnsDia = (funciones as Funcion[]).filter(f => f.fecha === dia)
                const fecha = new Date(dia + 'T12:00:00')
                const fechaStr = fecha.toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' })
                return (
                  <div key={dia}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>
                      {fechaStr}
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                      {fnsDia.map(f => (
                        <Link key={f.id} href={`/funcion/${f.id}`} style={{ textDecoration: 'none' }}>
                          <div style={{
                            background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12,
                            padding: '12px 20px', cursor: 'pointer', transition: 'all 0.15s',
                            textAlign: 'center',
                          }}>
                            <div style={{ fontWeight: 700, fontSize: 18 }}>{f.hora.slice(0,5)}</div>
                            <div style={{ fontSize: 12, color: '#f97316', fontWeight: 600, marginTop: 2 }}>
                              ${Number(f.precio).toLocaleString('es-CO')}
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
