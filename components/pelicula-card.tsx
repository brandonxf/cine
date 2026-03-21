'use client'
import Link from 'next/link'
import Image from 'next/image'
import type { Pelicula } from '@/lib/supabase/types'
import { useState } from 'react'

export function PeliculaCard({ pelicula }: { pelicula: Pelicula }) {
  const [hovered, setHovered] = useState(false)

  const clsColor: Record<string, string> = {
    'Todo Público': 'badge-green',
    '+7': 'badge-green',
    '+13': 'badge-amber',
    '+16': 'badge-amber',
    '+18': 'badge-red',
  }

  return (
    <Link href={`/pelicula/${pelicula.id}`} style={{ textDecoration: 'none', display: 'block' }}>
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          background: 'white', borderRadius: 18, overflow: 'hidden',
          border: '1px solid #e2e8f0', cursor: 'pointer',
          transition: 'all 0.3s cubic-bezier(0.34,1.56,0.64,1)',
          transform: hovered ? 'translateY(-6px) scale(1.01)' : 'translateY(0) scale(1)',
          boxShadow: hovered
            ? '0 20px 60px rgba(37,99,235,0.15), 0 4px 16px rgba(0,0,0,0.08)'
            : '0 2px 8px rgba(0,0,0,0.06)',
        }}
      >
        {/* Poster */}
        <div style={{ position: 'relative', aspectRatio: '2/3', background: '#f1f5f9', overflow: 'hidden' }}>
          {pelicula.imagen_url ? (
            <Image
              src={pelicula.imagen_url} alt={pelicula.titulo}
              fill style={{ objectFit: 'cover', transition: 'transform 0.4s ease' }}
              unoptimized
            />
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: 56, color: '#cbd5e1' }}>🎬</div>
          )}

          {/* Overlay on hover */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(to top, rgba(10,15,30,0.8) 0%, transparent 50%)',
            opacity: hovered ? 1 : 0, transition: 'opacity 0.3s',
            display: 'flex', alignItems: 'flex-end', padding: '1rem',
          }}>
            <div style={{
              background: '#2563eb', color: 'white',
              padding: '8px 16px', borderRadius: 10,
              fontSize: 13, fontWeight: 700, width: '100%', textAlign: 'center',
              transform: hovered ? 'translateY(0)' : 'translateY(10px)',
              transition: 'transform 0.3s',
            }}>
              Ver funciones →
            </div>
          </div>

          {/* Clasificación badge */}
          <div style={{ position: 'absolute', top: 10, left: 10 }}>
            <span className={`badge ${clsColor[pelicula.clasificacion] || 'badge-gray'}`} style={{ fontSize: 10 }}>
              {pelicula.clasificacion}
            </span>
          </div>
        </div>

        {/* Info */}
        <div style={{ padding: '1rem' }}>
          <h3 style={{ fontWeight: 800, fontSize: 15, color: '#0a0f1e', marginBottom: 6, lineHeight: 1.3 }}>
            {pelicula.titulo}
          </h3>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <span className="badge badge-blue" style={{ fontSize: 10 }}>{pelicula.genero}</span>
            <span className="badge badge-gray" style={{ fontSize: 10 }}>{pelicula.duracion} min</span>
          </div>
        </div>
      </div>
    </Link>
  )
}
