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
    .from('funciones').select('*').eq('pelicula_id', id).eq('estado', 'disponible')
    .gte('fecha', hoy).order('fecha').order('hora')

  const diasUnicos = [...new Set((funciones || []).map((f: Funcion) => f.fecha))]
  const p = pelicula as Pelicula

  return (
    <div className="page animate-fade-in">
      <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#64748b', textDecoration: 'none', fontSize: 14, fontWeight: 600, marginBottom: '2rem' }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        Volver a cartelera
      </Link>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(220px, 280px) 1fr', gap: '3rem', alignItems: 'start' }}>
        {/* Poster */}
        <div className="animate-fade-up card" style={{ padding: 0, overflow: 'hidden', borderRadius: 20 }}>
          <div style={{ position: 'relative', aspectRatio: '2/3' }}>
            {p.imagen_url
              ? <Image src={p.imagen_url} alt={p.titulo} fill style={{ objectFit: 'cover' }} unoptimized />
              : <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: 64, background: '#f1f5f9' }}>🎬</div>
            }
          </div>
        </div>

        {/* Info */}
        <div>
          <div className="animate-fade-up" style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: '1rem' }}>
            <span className="badge badge-blue">{p.genero}</span>
            <span className="badge badge-gray">{p.duracion} min</span>
            <span className="badge badge-amber">{p.clasificacion}</span>
          </div>

          <h1 className="animate-fade-up delay-1" style={{ fontFamily: 'DM Serif Display, serif', fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 400, color: '#0a0f1e', lineHeight: 1.1, marginBottom: '1rem', letterSpacing: '-0.02em' }}>
            {p.titulo}
          </h1>

          <p className="animate-fade-up delay-2" style={{ color: '#64748b', lineHeight: 1.8, fontSize: 15, marginBottom: '2.5rem', maxWidth: 560 }}>
            {p.descripcion}
          </p>

          {/* Funciones */}
          <div className="animate-fade-up delay-3">
            <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0a0f1e', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 20 }}>📅</span> Funciones disponibles
            </h2>

            {!funciones?.length ? (
              <div style={{ background: '#f8fafc', borderRadius: 16, padding: '2rem', textAlign: 'center', border: '1px solid #e2e8f0' }}>
                <p style={{ color: '#94a3b8', fontSize: 15 }}>No hay funciones disponibles por el momento</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {diasUnicos.map(dia => {
                  const fnsDia = (funciones as Funcion[]).filter(f => f.fecha === dia)
                  const fechaStr = new Date(dia + 'T12:00:00').toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' })
                  return (
                    <div key={dia}>
                      <p style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>{fechaStr}</p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                        {fnsDia.map(f => (
                          <Link key={f.id} href={`/funcion/${f.id}`} style={{ textDecoration: 'none' }}>
                            <div className="card" style={{
                              padding: '14px 22px', textAlign: 'center', cursor: 'pointer',
                              border: '2px solid #e2e8f0', transition: 'all 0.2s',
                            }}
                              onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = '#2563eb'; el.style.background = '#eff6ff' }}
                              onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = '#e2e8f0'; el.style.background = 'white' }}
                            >
                              <div style={{ fontWeight: 800, fontSize: 20, color: '#0a0f1e' }}>{f.hora.slice(0, 5)}</div>
                              <div style={{ fontSize: 12, color: '#2563eb', fontWeight: 700, marginTop: 4 }}>
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
    </div>
  )
}
