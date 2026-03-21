'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import type { Profile } from '@/lib/supabase/types'
import { usePathname } from 'next/navigation'

export function Navbar() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [dropOpen, setDropOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const supabase = createClient()
  const pathname = usePathname()

  useEffect(() => {
    setMobileOpen(false)
    setDropOpen(false)
  }, [pathname])

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
      if (data.user) {
        supabase.from('profiles').select('*').eq('id', data.user.id).single()
          .then(({ data: p }) => setProfile(p))
      }
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null)
      if (!session?.user) {
        setProfile(null)
      } else {
        supabase.from('profiles').select('*').eq('id', session.user.id).single()
          .then(({ data: p }) => setProfile(p))
      }
    })
    return () => subscription.unsubscribe()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  const navLinks = [
    { href: '/', label: '🎬 Cartelera' },
    { href: '/validar', label: '✅ Validar tiquete' },
    ...(profile?.rol === 'admin' ? [{ href: '/admin', label: '⚙️ Admin' }] : []),
  ]

  return (
    <>
      <nav style={{
        background: 'rgba(5,5,15,0.97)',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        backdropFilter: 'blur(16px)',
        position: 'sticky', top: 0, zIndex: 50,
        padding: '0 1.25rem',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 60 }}>
          {/* Logo */}
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
            <span style={{ fontSize: 22 }}>🎬</span>
            <span style={{ fontWeight: 900, fontSize: 20, color: '#f97316', letterSpacing: '-0.5px' }}>CineApp</span>
          </Link>

          {/* Desktop links */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }} className="desktop-nav">
            <Link href="/" style={{ color: 'rgba(255,255,255,0.65)', textDecoration: 'none', padding: '7px 12px', borderRadius: 8, fontSize: 14, fontWeight: 500 }}>Cartelera</Link>
            <Link href="/validar" style={{ color: 'rgba(255,255,255,0.65)', textDecoration: 'none', padding: '7px 12px', borderRadius: 8, fontSize: 14, fontWeight: 500 }}>Validar</Link>
            {profile?.rol === 'admin' && (
              <Link href="/admin" style={{ color: 'rgba(255,255,255,0.65)', textDecoration: 'none', padding: '7px 12px', borderRadius: 8, fontSize: 14, fontWeight: 500 }}>Admin</Link>
            )}
          </div>

          {/* Right side */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {/* Desktop auth */}
            <div className="desktop-nav">
              {user ? (
                <div style={{ position: 'relative' }}>
                  <button onClick={() => setDropOpen(!dropOpen)} style={{
                    background: 'rgba(249,115,22,0.12)', border: '1px solid rgba(249,115,22,0.25)',
                    borderRadius: 8, padding: '7px 14px', color: '#f97316', fontSize: 14,
                    fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
                  }}>
                    <span style={{ width: 22, height: 22, borderRadius: '50%', background: '#f97316', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: 'white', fontWeight: 800 }}>
                      {(profile?.nombre || user.email || 'U')[0].toUpperCase()}
                    </span>
                    <span>{profile?.nombre?.split(' ')[0] || 'Usuario'}</span>
                    <span style={{ fontSize: 9, opacity: 0.6 }}>{dropOpen ? '▲' : '▼'}</span>
                  </button>
                  {dropOpen && (
                    <>
                      <div onClick={() => setDropOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 10 }} />
                      <div style={{
                        position: 'absolute', right: 0, top: 'calc(100% + 8px)', zIndex: 20,
                        background: '#111120', border: '1px solid rgba(255,255,255,0.09)',
                        borderRadius: 14, minWidth: 190, overflow: 'hidden',
                        boxShadow: '0 12px 40px rgba(0,0,0,0.6)',
                      }}>
                        <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                          <div style={{ fontSize: 13, fontWeight: 700 }}>{profile?.nombre || 'Usuario'}</div>
                          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>{user.email}</div>
                        </div>
                        <Link href="/tiquetes" onClick={() => setDropOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 16px', color: 'rgba(255,255,255,0.8)', textDecoration: 'none', fontSize: 14 }}>
                          <span>🎟️</span> Mis Tiquetes
                        </Link>
                        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }} />
                        <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '11px 16px', color: '#ef4444', background: 'none', border: 'none', textAlign: 'left', fontSize: 14, cursor: 'pointer' }}>
                          <span>🚪</span> Cerrar sesion
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div style={{ display: 'flex', gap: 6 }}>
                  <Link href="/auth/login" style={{ color: 'rgba(255,255,255,0.65)', textDecoration: 'none', padding: '7px 14px', borderRadius: 8, fontSize: 14, fontWeight: 500 }}>Ingresar</Link>
                  <Link href="/auth/registro" style={{ background: '#f97316', color: 'white', textDecoration: 'none', padding: '7px 16px', borderRadius: 8, fontSize: 14, fontWeight: 700 }}>Registrarse</Link>
                </div>
              )}
            </div>

            {/* Mobile hamburger */}
            <button onClick={() => setMobileOpen(!mobileOpen)} className="mobile-nav"
              style={{ background: 'rgba(255,255,255,0.07)', border: 'none', borderRadius: 8, padding: '8px 10px', cursor: 'pointer', color: 'white', fontSize: 18, lineHeight: 1 }}>
              {mobileOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="mobile-nav" style={{
          position: 'fixed', top: 60, left: 0, right: 0, zIndex: 40,
          background: 'rgba(5,5,15,0.98)', borderBottom: '1px solid rgba(255,255,255,0.07)',
          padding: '1rem 1.25rem 1.5rem',
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 16 }}>
            {navLinks.map(l => (
              <Link key={l.href} href={l.href} style={{ padding: '11px 14px', borderRadius: 10, color: 'rgba(255,255,255,0.8)', textDecoration: 'none', fontSize: 15, fontWeight: 500, background: pathname === l.href ? 'rgba(249,115,22,0.1)' : 'transparent' }}>
                {l.label}
              </Link>
            ))}
            {user && (
              <Link href="/tiquetes" style={{ padding: '11px 14px', borderRadius: 10, color: 'rgba(255,255,255,0.8)', textDecoration: 'none', fontSize: 15, fontWeight: 500 }}>
                🎟️ Mis Tiquetes
              </Link>
            )}
          </div>
          {user ? (
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: 14 }}>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginBottom: 10, paddingLeft: 4 }}>{user.email}</div>
              <button onClick={handleLogout} style={{ width: '100%', padding: '11px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 10, color: '#ef4444', fontWeight: 700, cursor: 'pointer', fontSize: 14 }}>
                🚪 Cerrar sesion
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: 14 }}>
              <Link href="/auth/login" style={{ padding: '11px', borderRadius: 10, color: 'white', textDecoration: 'none', fontSize: 15, fontWeight: 600, textAlign: 'center', background: 'rgba(255,255,255,0.07)' }}>Ingresar</Link>
              <Link href="/auth/registro" style={{ padding: '11px', borderRadius: 10, color: 'white', textDecoration: 'none', fontSize: 15, fontWeight: 700, textAlign: 'center', background: '#f97316' }}>Registrarse</Link>
            </div>
          )}
        </div>
      )}

      <style>{`
        .desktop-nav { display: flex; }
        .mobile-nav { display: none; }
        @media (max-width: 640px) {
          .desktop-nav { display: none !important; }
          .mobile-nav { display: flex !important; }
        }
      `}</style>
    </>
  )
}
