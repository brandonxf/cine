import { createClient } from '@/lib/supabase/server'
import type { Pelicula } from '@/lib/supabase/types'
import Link from 'next/link'
import Image from 'next/image'

export const revalidate = 60

export default async function HomePage() {
  const supabase = await createClient()
  const { data: peliculas, error } = await supabase
    .from('peliculas')
    .select('*')
    .eq('estado', 'activa')
    .order('created_at', { ascending: false })

  if (error) {
    return (
      <div style={{ maxWidth: 600, margin: '4rem auto', padding: '2rem', textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>⚙️</div>
        <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Configurando la base de datos</h1>
        <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: 24 }}>
          Aún no se han ejecutado los scripts SQL en Supabase. Sigue los pasos de configuración para activar la app.
        </p>
        <div style={{ background: '#12121e', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '1rem', textAlign: 'left', fontFamily: 'monospace', fontSize: 12, color: '#f97316' }}>
          {error.message}
        </div>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '2rem 1.5rem' }}>
      {/* Hero */}
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 900, lineHeight: 1.1, marginBottom: '1rem' }}>
          La mejor experiencia<br />
          <span style={{ color: '#f97316' }}>en pantalla grande</span>
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 18 }}>
          Selecciona tu película, elige tus asientos y compra tus tiquetes en segundos
        </p>
      </div>

      {/* Cartelera */}
      <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: 8 }}>
        🎬 Cartelera
      </h2>

      {!peliculas?.length ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'rgba(255,255,255,0.4)' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🎭</div>
          <p>No hay películas disponibles en este momento</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1.5rem' }}>
          {(peliculas as Pelicula[]).map(pelicula => (
            <Link key={pelicula.id} href={`/pelicula/${pelicula.id}`} style={{ textDecoration: 'none' }}>
              <div style={{
                background: '#12121e', borderRadius: 16, overflow: 'hidden',
                border: '1px solid rgba(255,255,255,0.06)',
                transition: 'transform 0.2s, border-color 0.2s',
                cursor: 'pointer',
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-4px)'; (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(249,115,22,0.4)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,255,255,0.06)' }}
              >
                <div style={{ position: 'relative', aspectRatio: '2/3', background: '#1a1a2e' }}>
                  {pelicula.imagen_url ? (
                    <Image src={pelicula.imagen_url} alt={pelicula.titulo} fill style={{ objectFit: 'cover' }} unoptimized />
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: 48 }}>🎬</div>
                  )}
                  <div style={{
                    position: 'absolute', top: 8, right: 8,
                    background: 'rgba(0,0,0,0.8)', borderRadius: 6, padding: '2px 8px',
                    fontSize: 11, fontWeight: 700, color: '#f97316',
                  }}>{pelicula.clasificacion}</div>
                </div>
                <div style={{ padding: '1rem' }}>
                  <h3 style={{ fontWeight: 700, fontSize: 15, marginBottom: 6, lineHeight: 1.3 }}>{pelicula.titulo}</h3>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', background: 'rgba(255,255,255,0.06)', padding: '2px 8px', borderRadius: 4 }}>{pelicula.genero}</span>
                    <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', background: 'rgba(255,255,255,0.06)', padding: '2px 8px', borderRadius: 4 }}>{pelicula.duracion} min</span>
                  </div>
                  <div style={{ marginTop: 12, padding: '8px 12px', background: 'rgba(249,115,22,0.1)', borderRadius: 8, textAlign: 'center', color: '#f97316', fontSize: 13, fontWeight: 600 }}>
                    Ver funciones →
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
