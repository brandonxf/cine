import Link from 'next/link'
import { IconFilm, IconArrowRight } from '@/components/icons'

export default function NotFound() {
  return (
    <div className="hero-bg" style={{ minHeight: '85vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', textAlign: 'center' }}>
      <div className="animate-fade-up">
        <div style={{ width: 80, height: 80, borderRadius: 24, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
          <IconFilm size={36} color="#2563eb" />
        </div>
        <h1 style={{ fontFamily: 'DM Serif Display, serif', fontSize: 96, fontWeight: 400, color: '#2563eb', lineHeight: 1, marginBottom: 8 }}>404</h1>
        <h2 style={{ fontSize: 24, fontWeight: 800, color: '#0a0f1e', marginBottom: 12 }}>Esta página no existe</h2>
        <p style={{ color: '#64748b', marginBottom: '2rem', maxWidth: 360 }}>La película que buscas no está en cartelera.</p>
        <Link href="/" className="btn-primary" style={{ padding: '13px 28px', fontSize: 15, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
          Volver a cartelera <IconArrowRight size={16} color="white" />
        </Link>
      </div>
    </div>
  )
}
