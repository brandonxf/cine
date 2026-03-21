'use client'
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import type { Pelicula } from '@/lib/supabase/types'
import { IconArrowLeft, IconArrowRight, IconTicket, IconCalendar } from './icons'

export function HeroSlider({ peliculas }: { peliculas: Pelicula[] }) {
  const [current, setCurrent] = useState(0)
  const [animating, setAnimating] = useState(false)
  const total = peliculas.length

  const goTo = useCallback((idx: number) => {
    if (animating || total === 0) return
    setAnimating(true)
    setCurrent((idx + total) % total)
    setTimeout(() => setAnimating(false), 500)
  }, [animating, total])

  const next = useCallback(() => goTo(current + 1), [current, goTo])
  const prev = useCallback(() => goTo(current - 1), [current, goTo])

  // Auto-avance cada 5s
  useEffect(() => {
    if (total <= 1) return
    const timer = setInterval(next, 5000)
    return () => clearInterval(timer)
  }, [next, total])

  if (!total) return null

  const p = peliculas[current]

  return (
    <div style={{ position: 'relative', width: '100%', height: 'clamp(400px, 60vh, 600px)', overflow: 'hidden', background: '#0a0f1e' }}>

      {/* Imagen de fondo con overlay */}
      {peliculas.map((pelicula, i) => (
        <div key={pelicula.id} style={{
          position: 'absolute', inset: 0,
          opacity: i === current ? 1 : 0,
          transition: 'opacity 0.7s ease',
          pointerEvents: i === current ? 'auto' : 'none',
        }}>
          {pelicula.imagen_url && (
            <Image
              src={pelicula.imagen_url}
              alt={pelicula.titulo}
              fill
              style={{ objectFit: 'cover', objectPosition: 'center top' }}
              priority={i === 0}
              unoptimized
            />
          )}
          {/* Overlay gradiente */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(to right, rgba(10,15,30,0.92) 0%, rgba(10,15,30,0.6) 50%, rgba(10,15,30,0.2) 100%)',
          }} />
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(to top, rgba(10,15,30,0.8) 0%, transparent 60%)',
          }} />
        </div>
      ))}

      {/* Contenido */}
      <div style={{
        position: 'absolute', inset: 0, display: 'flex', alignItems: 'center',
        maxWidth: 1200, margin: '0 auto', padding: '0 1.5rem',
        left: 0, right: 0,
      }}>
        <div style={{
          maxWidth: 560,
          opacity: animating ? 0 : 1,
          transform: animating ? 'translateY(12px)' : 'translateY(0)',
          transition: 'all 0.4s ease',
        }}>
          {/* Badges */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
            <span style={{ background: 'rgba(37,99,235,0.8)', backdropFilter: 'blur(8px)', color: 'white', padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700, letterSpacing: '0.05em' }}>
              {p.genero}
            </span>
            <span style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', color: 'white', padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>
              {p.clasificacion}
            </span>
            <span style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', color: 'rgba(255,255,255,0.8)', padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 600 }}>
              {p.duracion} min
            </span>
          </div>

          {/* Título */}
          <h1 style={{
            fontFamily: 'DM Serif Display, serif',
            fontSize: 'clamp(2rem, 5vw, 3.5rem)',
            fontWeight: 400, color: 'white', lineHeight: 1.1,
            marginBottom: 12, letterSpacing: '-0.02em',
          }}>
            {p.titulo}
          </h1>

          {/* Descripción */}
          <p style={{
            color: 'rgba(255,255,255,0.65)', fontSize: 15, lineHeight: 1.7,
            marginBottom: 24,
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
          }}>
            {p.descripcion}
          </p>

          {/* CTAs */}
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Link href={`/pelicula/${p.id}`} style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: '#2563eb', color: 'white',
              padding: '12px 24px', borderRadius: 12, fontWeight: 800, fontSize: 15,
              textDecoration: 'none', transition: 'all 0.2s',
              boxShadow: '0 4px 20px rgba(37,99,235,0.4)',
            }}>
              <IconCalendar size={16} color="white" /> Ver funciones
            </Link>
            <Link href={`/pelicula/${p.id}`} style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'rgba(255,255,255,0.15)', color: 'white',
              backdropFilter: 'blur(8px)',
              padding: '12px 24px', borderRadius: 12, fontWeight: 700, fontSize: 15,
              textDecoration: 'none', border: '1.5px solid rgba(255,255,255,0.25)',
            }}>
              <IconTicket size={16} color="white" /> Comprar tiquetes
            </Link>
          </div>
        </div>
      </div>

      {/* Controles prev/next */}
      {total > 1 && (
        <>
          <button onClick={prev} style={{
            position: 'absolute', left: 20, top: '50%', transform: 'translateY(-50%)',
            width: 44, height: 44, borderRadius: '50%',
            background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)',
            border: '1.5px solid rgba(255,255,255,0.2)',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.2s', zIndex: 10,
          }}
            onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background = 'rgba(255,255,255,0.25)' }}
            onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background = 'rgba(255,255,255,0.12)' }}
          >
            <IconArrowLeft size={18} color="white" />
          </button>

          <button onClick={next} style={{
            position: 'absolute', right: 20, top: '50%', transform: 'translateY(-50%)',
            width: 44, height: 44, borderRadius: '50%',
            background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)',
            border: '1.5px solid rgba(255,255,255,0.2)',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.2s', zIndex: 10,
          }}
            onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background = 'rgba(255,255,255,0.25)' }}
            onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background = 'rgba(255,255,255,0.12)' }}
          >
            <IconArrowRight size={18} color="white" />
          </button>
        </>
      )}

      {/* Dots / indicadores */}
      {total > 1 && (
        <div style={{
          position: 'absolute', bottom: 24, left: 0, right: 0,
          display: 'flex', justifyContent: 'center', gap: 8, zIndex: 10,
        }}>
          {peliculas.map((_, i) => (
            <button key={i} onClick={() => goTo(i)} style={{
              width: i === current ? 28 : 8, height: 8,
              borderRadius: 4, border: 'none', cursor: 'pointer',
              background: i === current ? '#2563eb' : 'rgba(255,255,255,0.4)',
              transition: 'all 0.3s ease', padding: 0,
            }} />
          ))}
        </div>
      )}

      {/* Número de película actual */}
      <div style={{
        position: 'absolute', bottom: 24, right: 80,
        fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.5)',
      }}>
        {current + 1} / {total}
      </div>
    </div>
  )
}
