import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="hero-bg" style={{ minHeight: '85vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', textAlign: 'center' }}>
      <div className="animate-fade-up">
        <div style={{ fontSize: 80, marginBottom: '1rem' }}>🎬</div>
        <h1 style={{ fontFamily: 'DM Serif Display, serif', fontSize: 80, fontWeight: 400, color: '#2563eb', lineHeight: 1, marginBottom: '0.5rem' }}>404</h1>
        <h2 style={{ fontSize: 24, fontWeight: 800, color: '#0a0f1e', marginBottom: '0.75rem' }}>Esta página no existe</h2>
        <p style={{ color: '#64748b', marginBottom: '2rem', maxWidth: 360 }}>
          La película que buscas no está en cartelera. Vuelve al inicio.
        </p>
        <Link href="/" className="btn-primary" style={{ padding: '13px 28px', fontSize: 15 }}>
          Volver a cartelera
        </Link>
      </div>
    </div>
  )
}
