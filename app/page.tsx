import { createClient } from '@/lib/supabase/server'
import type { Pelicula } from '@/lib/supabase/types'
import { PeliculaCard } from '@/components/pelicula-card'
import { IconArrowRight, IconShield, IconFilm, IconStar, IconScreen, IconSparkle } from '@/components/icons'
import Link from 'next/link'

export const revalidate = 60

export default async function HomePage() {
  const supabase = await createClient()
  const { data: peliculas, error } = await supabase
    .from('peliculas').select('*').eq('estado', 'activa').order('created_at', { ascending: false })

  return (
    <div>
      {/* Hero */}
      <section className="hero-bg" style={{ padding: '5rem 1.5rem 4rem' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div className="animate-fade-up" style={{ textAlign: 'center', maxWidth: 680, margin: '0 auto' }}>
            <div className="badge badge-blue animate-fade-up" style={{ marginBottom: 20, fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <IconSparkle size={12} color="#1e40af" strokeWidth={2} /> La experiencia de cine, ahora digital
            </div>
            <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 'clamp(2.8rem, 6vw, 4.5rem)', fontWeight: 400, lineHeight: 1.1, color: '#0a0f1e', marginBottom: '1.25rem', letterSpacing: '-0.02em' }}>
              Tu película favorita,<br />
              <em style={{ color: '#2563eb', fontStyle: 'italic' }}>tu asiento elegido</em>
            </h1>
            <p className="animate-fade-up delay-1" style={{ fontSize: 18, color: '#64748b', lineHeight: 1.7, marginBottom: '2rem' }}>
              Explora la cartelera, selecciona tus asientos y compra tus tiquetes en segundos. Sin filas, sin esperas.
            </p>
            <div className="animate-fade-up delay-2" style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="#cartelera" className="btn-primary" style={{ padding: '13px 28px', fontSize: 15 }}>
                Ver cartelera <IconArrowRight size={16} color="white" />
              </Link>
              <Link href="/validar" className="btn-ghost" style={{ padding: '13px 28px', fontSize: 15, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                <IconShield size={16} color="#475569" /> Validar tiquete
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="animate-fade-up delay-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginTop: '4rem', maxWidth: 500, margin: '4rem auto 0' }}>
            {[
              { icon: <IconSeat size={22} color="#2563eb" />, value: '150', label: 'Asientos por sala' },
              { icon: <IconScreen size={22} color="#2563eb" />, value: '4K', label: 'Calidad de imagen' },
              { icon: <IconShield size={22} color="#2563eb" />, value: '100%', label: 'Digital y seguro' },
            ].map(stat => (
              <div key={stat.label} style={{ textAlign: 'center', padding: '1.5rem 1rem', background: 'rgba(255,255,255,0.7)', borderRadius: 16, border: '1px solid rgba(37,99,235,0.1)', backdropFilter: 'blur(8px)' }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}>{stat.icon}</div>
                <div style={{ fontSize: 28, fontWeight: 900, color: '#0a0f1e', fontFamily: 'DM Serif Display, serif' }}>{stat.value}</div>
                <div style={{ fontSize: 12, color: '#64748b', marginTop: 4, fontWeight: 600 }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cartelera */}
      <section id="cartelera" style={{ padding: '4rem 1.5rem' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div className="animate-fade-up" style={{ marginBottom: '2.5rem', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <IconFilm size={20} color="#2563eb" />
            </div>
            <div>
              <p className="section-title" style={{ marginBottom: 2 }}>En cartelera</p>
              <h2 style={{ fontSize: 28, fontWeight: 800, color: '#0a0f1e', letterSpacing: '-0.02em' }}>Películas disponibles</h2>
            </div>
          </div>

          {error ? (
            <div style={{ textAlign: 'center', padding: '4rem', background: 'white', borderRadius: 20, border: '1px solid #e2e8f0' }}>
              <p style={{ color: '#64748b' }}>Error conectando con la base de datos</p>
            </div>
          ) : !peliculas?.length ? (
            <div style={{ textAlign: 'center', padding: '5rem', background: 'white', borderRadius: 20, border: '1px solid #e2e8f0' }}>
              <div style={{ width: 72, height: 72, borderRadius: 20, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <IconFilm size={32} color="#2563eb" />
              </div>
              <h3 style={{ fontSize: 20, fontWeight: 700, color: '#0a0f1e', marginBottom: 8 }}>Sin películas por ahora</h3>
              <p style={{ color: '#64748b' }}>Vuelve pronto para ver las novedades</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: '1.5rem' }}>
              {(peliculas as Pelicula[]).map((pelicula, i) => (
                <div key={pelicula.id} className={`animate-fade-up delay-${Math.min(i + 1, 5)}`}>
                  <PeliculaCard pelicula={pelicula} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '2rem 1.5rem 5rem' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ background: 'linear-gradient(135deg, #1e40af 0%, #2563eb 50%, #7c3aed 100%)', borderRadius: 24, padding: '3.5rem 2.5rem', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
            <div style={{ position: 'absolute', bottom: -60, left: -40, width: 250, height: 250, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ width: 56, height: 56, borderRadius: 16, background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <IconShield size={28} color="white" />
              </div>
              <h2 style={{ fontFamily: 'DM Serif Display, serif', fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', color: 'white', marginBottom: 12, fontWeight: 400 }}>
                ¿Tienes un tiquete?
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.75)', marginBottom: 24, fontSize: 16 }}>
                Valida tu código de acceso antes de entrar a la sala
              </p>
              <Link href="/validar" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'white', color: '#1e40af', padding: '13px 28px', borderRadius: 12, fontWeight: 800, fontSize: 15, textDecoration: 'none' }}>
                Validar tiquete <IconArrowRight size={16} color="#1e40af" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

// Inline icon for stats (imported from icons doesn't work in server components with JSX directly)
function IconSeat({ size, color }: { size: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7Z"/>
      <path d="M4 14v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3"/>
      <path d="M7 14v3M17 14v3"/>
    </svg>
  )
}
