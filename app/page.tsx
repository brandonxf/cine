import { createClient } from '@/lib/supabase/server'
import type { Pelicula } from '@/lib/supabase/types'
import { PeliculaCard } from '@/components/pelicula-card'
import { HeroSlider } from '@/components/hero-slider'
import { IconFilm, IconShield, IconArrowRight } from '@/components/icons'
import Link from 'next/link'

export const revalidate = 60

export default async function HomePage() {
  const supabase = await createClient()
  const { data: peliculas } = await supabase
    .from('peliculas').select('*').eq('estado', 'activa').order('created_at', { ascending: false })

  const lista = (peliculas || []) as Pelicula[]

  return (
    <div>
      {/* Slider hero */}
      {lista.length > 0
        ? <HeroSlider peliculas={lista} />
        : (
          <div style={{ height: 300, background: 'linear-gradient(135deg, #1e40af, #2563eb)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ textAlign: 'center', color: 'white' }}>
              <IconFilm size={48} color="rgba(255,255,255,0.5)" style={{ margin: '0 auto 12px', display: 'block' }} />
              <p style={{ fontSize: 18, fontWeight: 700, opacity: 0.7 }}>No hay películas disponibles</p>
            </div>
          </div>
        )
      }

      {/* Cartelera */}
      <section id="cartelera" style={{ padding: '3.5rem 1.5rem' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div className="animate-fade-up" style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <IconFilm size={20} color="#2563eb" />
              </div>
              <div>
                <p className="section-title" style={{ marginBottom: 2 }}>En cartelera</p>
                <h2 style={{ fontSize: 26, fontWeight: 900, color: '#0a0f1e', letterSpacing: '-0.02em' }}>
                  Películas disponibles
                </h2>
              </div>
            </div>
            <span className="badge badge-blue" style={{ fontSize: 12 }}>{lista.length} películas</span>
          </div>

          {!lista.length ? (
            <div style={{ textAlign: 'center', padding: '5rem', background: 'white', borderRadius: 20, border: '1px solid #e2e8f0' }}>
              <IconFilm size={40} color="#cbd5e1" style={{ margin: '0 auto 16px', display: 'block' }} />
              <h3 style={{ fontSize: 18, fontWeight: 700, color: '#0a0f1e', marginBottom: 8 }}>Sin películas por ahora</h3>
              <p style={{ color: '#64748b' }}>Vuelve pronto para ver las novedades</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: '1.25rem' }}>
              {lista.map((pelicula, i) => (
                <div key={pelicula.id} className={`animate-fade-up delay-${Math.min(i + 1, 5)}`}>
                  <PeliculaCard pelicula={pelicula} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA validar */}
      <section style={{ padding: '0 1.5rem 4rem' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{
            background: 'linear-gradient(135deg, #1e40af 0%, #2563eb 50%, #7c3aed 100%)',
            borderRadius: 24, padding: '3rem 2.5rem',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            gap: '2rem', flexWrap: 'wrap',
            position: 'relative', overflow: 'hidden',
          }}>
            <div style={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
            <div style={{ position: 'absolute', bottom: -60, left: 200, width: 250, height: 250, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />
            <div style={{ position: 'relative' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <IconShield size={22} color="rgba(255,255,255,0.8)" />
                <h2 style={{ fontFamily: 'DM Serif Display, serif', fontSize: 'clamp(1.4rem, 3vw, 2rem)', color: 'white', fontWeight: 400 }}>
                  ¿Ya tienes tu tiquete?
                </h2>
              </div>
              <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 15 }}>
                Valida tu código antes de entrar a la sala
              </p>
            </div>
            <Link href="/validar" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'white', color: '#1e40af',
              padding: '13px 28px', borderRadius: 12, fontWeight: 800, fontSize: 15,
              textDecoration: 'none', flexShrink: 0, position: 'relative',
              transition: 'transform 0.2s',
            }}>
              Validar tiquete <IconArrowRight size={16} color="#1e40af" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
