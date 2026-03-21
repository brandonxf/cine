import { createClient } from '@/lib/supabase/server'
import type { Funcion, Pelicula } from '@/lib/supabase/types'
import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { IconArrowLeft, IconCalendar, IconFilm } from '@/components/icons'
import { FuncionCard } from '@/components/funcion-card'

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
        <IconArrowLeft size={15} color="#64748b" /> Volver a cartelera
      </Link>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(180px, 260px) 1fr', gap: '2.5rem', alignItems: 'start' }} className="pelicula-grid">
        {/* Poster */}
        <div className="animate-fade-up card" style={{ padding: 0, overflow: 'hidden', borderRadius: 20 }}>
          <div style={{ position: 'relative', aspectRatio: '2/3', background: '#f1f5f9' }}>
            {p.imagen_url
              ? <Image src={p.imagen_url} alt={p.titulo} fill style={{ objectFit: 'cover' }} unoptimized />
              : <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                  <IconFilm size={48} color="#cbd5e1" />
                </div>
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

          <h1 className="animate-fade-up delay-1" style={{ fontFamily: 'DM Serif Display, serif', fontSize: 'clamp(1.8rem, 4vw, 3rem)', fontWeight: 400, color: '#0a0f1e', lineHeight: 1.1, marginBottom: '1rem', letterSpacing: '-0.02em' }}>
            {p.titulo}
          </h1>

          <p className="animate-fade-up delay-2" style={{ color: '#64748b', lineHeight: 1.8, fontSize: 15, marginBottom: '2.5rem', maxWidth: 560 }}>
            {p.descripcion}
          </p>

          {/* Funciones */}
          <div className="animate-fade-up delay-3">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '1.25rem' }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <IconCalendar size={16} color="#2563eb" />
              </div>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0a0f1e' }}>Funciones disponibles</h2>
            </div>

            {!funciones?.length ? (
              <div style={{ background: '#f8fafc', borderRadius: 16, padding: '2rem', textAlign: 'center', border: '1px solid #e2e8f0' }}>
                <IconCalendar size={28} color="#cbd5e1" style={{ margin: '0 auto 10px', display: 'block' }} />
                <p style={{ color: '#94a3b8', fontSize: 15 }}>No hay funciones disponibles por el momento</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {diasUnicos.map(dia => {
                  const fnsDia = (funciones as Funcion[]).filter(f => f.fecha === dia)
                  const fechaStr = new Date(dia + 'T12:00:00').toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' })
                  return (
                    <div key={dia}>
                      <p style={{ fontSize: 11, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 10 }}>{fechaStr}</p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                        {fnsDia.map(f => <FuncionCard key={f.id} funcion={f} />)}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 640px) {
          .pelicula-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}
