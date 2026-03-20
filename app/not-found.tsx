import Link from 'next/link'

export default function NotFound() {
  return (
    <div style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', textAlign: 'center' }}>
      <div style={{ fontSize: 80, marginBottom: '1rem' }}>🎬</div>
      <h1 style={{ fontSize: 72, fontWeight: 900, color: '#f97316', lineHeight: 1, marginBottom: '0.5rem' }}>404</h1>
      <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: '0.75rem' }}>Esta pagina no existe</h2>
      <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '2rem', maxWidth: 360 }}>
        La pelicula que buscas no esta en cartelera. Vuelve al inicio para ver lo que tenemos disponible.
      </p>
      <Link href="/" style={{
        background: '#f97316', color: 'white', textDecoration: 'none',
        padding: '12px 28px', borderRadius: 12, fontWeight: 700, fontSize: 15,
      }}>
        Volver a cartelera
      </Link>
    </div>
  )
}
