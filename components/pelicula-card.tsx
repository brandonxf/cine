'use client'
import Link from 'next/link'
import Image from 'next/image'
import type { Pelicula } from '@/lib/supabase/types'

export function PeliculaCard({ pelicula }: { pelicula: Pelicula }) {
  return (
    <Link href={`/pelicula/${pelicula.id}`} style={{ textDecoration: 'none' }}>
      <div style={{
        background: '#12121e', borderRadius: 16, overflow: 'hidden',
        border: '1px solid rgba(255,255,255,0.06)', cursor: 'pointer',
        transition: 'transform 0.2s, border-color 0.2s',
      }}
        onMouseEnter={e => {
          const el = e.currentTarget as HTMLDivElement
          el.style.transform = 'translateY(-4px)'
          el.style.borderColor = 'rgba(249,115,22,0.4)'
        }}
        onMouseLeave={e => {
          const el = e.currentTarget as HTMLDivElement
          el.style.transform = 'translateY(0)'
          el.style.borderColor = 'rgba(255,255,255,0.06)'
        }}
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
          <h3 style={{ fontWeight: 700, fontSize: 15, marginBottom: 6, lineHeight: 1.3, color: 'white' }}>{pelicula.titulo}</h3>
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
  )
}
