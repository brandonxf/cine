import { createClient } from '@/lib/supabase/server'
import type { Pelicula } from '@/lib/supabase/types'
import { PeliculaCard } from '@/components/pelicula-card'

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
          Aún no se han ejecutado los scripts SQL en Supabase.
        </p>
        <div style={{ background: '#12121e', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '1rem', textAlign: 'left', fontFamily: 'monospace', fontSize: 12, color: '#f97316' }}>
          {error.message}
        </div>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '2rem 1.5rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 900, lineHeight: 1.1, marginBottom: '1rem' }}>
          La mejor experiencia<br />
          <span style={{ color: '#f97316' }}>en pantalla grande</span>
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 18 }}>
          Selecciona tu película, elige tus asientos y compra tus tiquetes en segundos
        </p>
      </div>

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
            <PeliculaCard key={pelicula.id} pelicula={pelicula} />
          ))}
        </div>
      )}
    </div>
  )
}
