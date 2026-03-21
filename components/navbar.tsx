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
  const [scrolled, setScrolled] = useState(false)
  const supabase = createClient()
  const pathname = usePathname()

  useEffect(() => {
    setMobileOpen(false)
    setDropOpen(false)
  }, [pathname])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

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
    { href: '/', label: 'Cartelera' },
    { href: '/validar', label: 'Validar tiquete' },
    ...(profile?.rol === 'admin' ? [{ href: '/admin', label: 'Panel Admin' }] : []),
  ]

  const isActive = (href: string) => pathname === href

  return (
    <>
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: scrolled ? 'rgba(255,255,255,0.92)' : 'rgba(255,255,255,0.8)',
        backdropFilter: 'blur(20px)',
        borderBottom: scrolled ? '1px solid #e2e8f0' : '1px solid rgba(226,232,240,0.5)',
        transition: 'all 0.3s ease',
        boxShadow: scrolled ? '0 4px 24px rgba(37,99,235,0.06)' : 'none',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>

          {/* Logo */}
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 18, boxShadow: '0 4px 12px rgba(37,99,235,0.3)',
            }}>🎬</div>
            <span style={{ fontWeight: 900, fontSize: 20, color: '#0a0f1e', letterSpacing: '-0.5px' }}>
              Cine<span style={{ color: '#2563eb' }}>App</span>
            </span>
          </Link>

          {/* Desktop links */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }} className="desktop-nav">
            {navLinks.map(link => (
              <Link key={link.href} href={link.href} style={{
                padding: '7px 14px', borderRadius: 8, fontSize: 14, fontWeight: 600,
                textDecoration: 'none', transition: 'all 0.15s',
                color: isActive(link.href) ? '#2563eb' : '#475569',
                background: isActive(link.href) ? '#eff6ff' : 'transparent',
              }}>
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div className="desktop-nav" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {user ? (
                <div style={{ position: 'relative' }}>
                  <button onClick={() => setDropOpen(!dropOpen)} style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    background: 'transparent', border: '1.5px solid #e2e8f0',
                    borderRadius: 40, padding: '5px 14px 5px 6px',
                    cursor: 'pointer', transition: 'all 0.2s',
                  }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#2563eb'; (e.currentTarget as HTMLElement).style.background = '#eff6ff' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#e2e8f0'; (e.currentTarget as HTMLElement).style.background = 'transparent' }}
                  >
                    <div style={{
                      width: 28, height: 28, borderRadius: '50%',
                      background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 12, color: 'white', fontWeight: 800,
                    }}>
                      {(profile?.nombre || user.email || 'U')[0].toUpperCase()}
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#0a0f1e' }}>
                      {profile?.nombre?.split(' ')[0] || 'Usuario'}
                    </span>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2.5">
                      <polyline points="6 9 12 15 18 9"/>
                    </svg>
                  </button>

                  {dropOpen && (
                    <>
                      <div onClick={() => setDropOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 10 }} />
                      <div className="animate-slide-down" style={{
                        position: 'absolute', right: 0, top: 'calc(100% + 10px)', zIndex: 20,
                        background: 'white', border: '1px solid #e2e8f0',
                        borderRadius: 16, minWidth: 210, overflow: 'hidden',
                        boxShadow: '0 20px 60px rgba(0,0,0,0.12), 0 4px 16px rgba(37,99,235,0.08)',
                      }}>
                        <div style={{ padding: '14px 16px', borderBottom: '1px solid #f1f5f9', background: '#fafbff' }}>
                          <div style={{ fontSize: 14, fontWeight: 700, color: '#0a0f1e' }}>{profile?.nombre || 'Usuario'}</div>
                          <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>{user.email}</div>
                          {profile?.rol === 'admin' && (
                            <span className="badge badge-blue" style={{ marginTop: 6 }}>Admin</span>
                          )}
                        </div>
                        {[
                          { href: '/tiquetes', icon: '🎟️', label: 'Mis Tiquetes' },
                          ...(profile?.rol === 'admin' ? [{ href: '/admin', icon: '⚙️', label: 'Panel Admin' }] : []),
                        ].map(item => (
                          <Link key={item.href} href={item.href} onClick={() => setDropOpen(false)} style={{
                            display: 'flex', alignItems: 'center', gap: 10,
                            padding: '11px 16px', color: '#374151', textDecoration: 'none',
                            fontSize: 14, fontWeight: 500, transition: 'background 0.15s',
                          }}
                            onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#f8fafc'}
                            onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
                          >
                            <span style={{ fontSize: 16 }}>{item.icon}</span> {item.label}
                          </Link>
                        ))}
                        <div style={{ borderTop: '1px solid #f1f5f9' }} />
                        <button onClick={handleLogout} style={{
                          display: 'flex', alignItems: 'center', gap: 10, width: '100%',
                          padding: '11px 16px', color: '#ef4444', background: 'none',
                          border: 'none', textAlign: 'left', fontSize: 14, fontWeight: 500, cursor: 'pointer',
                          transition: 'background 0.15s', fontFamily: 'Plus Jakarta Sans, sans-serif',
                        }}
                          onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#fef2f2'}
                          onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
                        >
                          <span style={{ fontSize: 16 }}>🚪</span> Cerrar sesión
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <>
                  <Link href="/auth/login" className="btn-ghost" style={{ padding: '8px 18px' }}>Ingresar</Link>
                  <Link href="/auth/registro" className="btn-primary" style={{ padding: '8px 18px' }}>Registrarse</Link>
                </>
              )}
            </div>

            {/* Mobile hamburger */}
            <button onClick={() => setMobileOpen(!mobileOpen)} className="mobile-nav" style={{
              background: mobileOpen ? '#eff6ff' : 'transparent',
              border: '1.5px solid #e2e8f0', borderRadius: 10,
              padding: '8px', cursor: 'pointer', color: '#374151',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.2s',
            }}>
              {mobileOpen ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="3" y1="8" x2="21" y2="8"/><line x1="3" y1="16" x2="21" y2="16"/></svg>
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="mobile-nav animate-slide-down" style={{
          position: 'fixed', top: 64, left: 0, right: 0, zIndex: 90,
          background: 'white', borderBottom: '1px solid #e2e8f0',
          padding: '1rem 1.5rem 1.5rem',
          boxShadow: '0 20px 40px rgba(0,0,0,0.08)',
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 16 }}>
            {navLinks.map(link => (
              <Link key={link.href} href={link.href} style={{
                padding: '12px 14px', borderRadius: 10, fontSize: 15, fontWeight: 600,
                color: isActive(link.href) ? '#2563eb' : '#374151', textDecoration: 'none',
                background: isActive(link.href) ? '#eff6ff' : 'transparent',
              }}>
                {link.label}
              </Link>
            ))}
            {user && (
              <Link href="/tiquetes" style={{ padding: '12px 14px', borderRadius: 10, fontSize: 15, fontWeight: 600, color: '#374151', textDecoration: 'none' }}>
                🎟️ Mis Tiquetes
              </Link>
            )}
          </div>
          {user ? (
            <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 14 }}>
              <div style={{ fontSize: 13, color: '#94a3b8', marginBottom: 10, paddingLeft: 4 }}>{user.email}</div>
              <button onClick={handleLogout} style={{
                width: '100%', padding: '11px', background: '#fef2f2',
                border: '1px solid #fecaca', borderRadius: 10, color: '#ef4444',
                fontWeight: 700, cursor: 'pointer', fontSize: 14,
                fontFamily: 'Plus Jakarta Sans, sans-serif',
              }}>
                Cerrar sesión
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, borderTop: '1px solid #f1f5f9', paddingTop: 14 }}>
              <Link href="/auth/login" className="btn-ghost" style={{ textAlign: 'center', justifyContent: 'center' }}>Ingresar</Link>
              <Link href="/auth/registro" className="btn-primary" style={{ textAlign: 'center', justifyContent: 'center' }}>Registrarse</Link>
            </div>
          )}
        </div>
      )}

      <style>{`
        .desktop-nav { display: flex !important; }
        .mobile-nav  { display: none !important; }
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-nav  { display: flex !important; }
        }
      `}</style>
    </>
  )
}
