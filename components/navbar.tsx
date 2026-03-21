'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import type { Profile } from '@/lib/supabase/types'
import { usePathname } from 'next/navigation'
import { IconFilm, IconTicket, IconSettings, IconUser, IconLogOut, IconChevronDown, IconShield, IconArrowRight, IconCheck } from './icons'

export function Navbar() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [dropOpen, setDropOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const supabase = createClient()
  const pathname = usePathname()

  useEffect(() => { setMobileOpen(false); setDropOpen(false) }, [pathname])
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
      if (data.user) supabase.from('profiles').select('*').eq('id', data.user.id).single().then(({ data: p }) => setProfile(p))
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null)
      if (!session?.user) setProfile(null)
      else supabase.from('profiles').select('*').eq('id', session.user.id).single().then(({ data: p }) => setProfile(p))
    })
    return () => subscription.unsubscribe()
  }, [])

  const handleLogout = async () => { await supabase.auth.signOut(); window.location.href = '/' }
  const isActive = (href: string) => pathname === href

  const navLinks = [
    { href: '/', label: 'Cartelera', icon: <IconFilm size={18} /> },
    { href: '/validar', label: 'Validar tiquete', icon: <IconShield size={18} /> },
    ...(profile?.rol === 'admin' ? [{ href: '/admin', label: 'Panel Admin', icon: <IconSettings size={18} /> }] : []),
  ]

  return (
    <>
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: scrolled ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.8)',
        backdropFilter: 'blur(20px)',
        borderBottom: scrolled ? '1px solid #e2e8f0' : '1px solid rgba(226,232,240,0.5)',
        transition: 'all 0.3s ease',
        boxShadow: scrolled ? '0 4px 24px rgba(37,99,235,0.06)' : 'none',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>

          {/* Logo */}
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #2563eb, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(37,99,235,0.3)' }}>
              <IconFilm size={18} color="white" strokeWidth={2} />
            </div>
            <span style={{ fontWeight: 900, fontSize: 20, color: '#0a0f1e', letterSpacing: '-0.5px' }}>
              Cine<span style={{ color: '#2563eb' }}>App</span>
            </span>
          </Link>

          {/* Desktop links */}
          <div className="desktop-nav" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            {navLinks.map(link => (
              <Link key={link.href} href={link.href} style={{
                display: 'flex', alignItems: 'center', gap: 7,
                padding: '7px 14px', borderRadius: 8, fontSize: 14, fontWeight: 600,
                textDecoration: 'none', transition: 'all 0.15s',
                color: isActive(link.href) ? '#2563eb' : '#475569',
                background: isActive(link.href) ? '#eff6ff' : 'transparent',
              }}>
                {link.icon} {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop auth */}
          <div className="desktop-nav" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {user ? (
              <div style={{ position: 'relative' }}>
                <button onClick={() => setDropOpen(!dropOpen)} style={{
                  display: 'flex', alignItems: 'center', gap: 8, background: 'transparent',
                  border: '1.5px solid #e2e8f0', borderRadius: 40, padding: '5px 12px 5px 6px',
                  cursor: 'pointer', transition: 'all 0.2s',
                }}
                  onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = '#2563eb'; el.style.background = '#eff6ff' }}
                  onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = '#e2e8f0'; el.style.background = 'transparent' }}
                >
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg, #2563eb, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: 'white', fontWeight: 800 }}>
                    {(profile?.nombre || user.email || 'U')[0].toUpperCase()}
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#0a0f1e' }}>{profile?.nombre?.split(' ')[0] || 'Usuario'}</span>
                  <IconChevronDown size={12} color="#94a3b8" strokeWidth={2.5} />
                </button>

                {dropOpen && (
                  <>
                    <div onClick={() => setDropOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 10 }} />
                    <div className="animate-slide-down" style={{
                      position: 'absolute', right: 0, top: 'calc(100% + 10px)', zIndex: 20,
                      background: 'white', border: '1px solid #e2e8f0', borderRadius: 16,
                      minWidth: 210, overflow: 'hidden',
                      boxShadow: '0 20px 60px rgba(0,0,0,0.1), 0 4px 16px rgba(37,99,235,0.08)',
                    }}>
                      <div style={{ padding: '14px 16px', borderBottom: '1px solid #f1f5f9', background: '#fafbff' }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: '#0a0f1e' }}>{profile?.nombre || 'Usuario'}</div>
                        <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>{user.email}</div>
                        {profile?.rol === 'admin' && <span className="badge badge-blue" style={{ marginTop: 6 }}>Admin</span>}
                      </div>
                      {[
                        { href: '/tiquetes', icon: <IconTicket size={15} color="#2563eb" />, label: 'Mis Tiquetes' },
                        ...(profile?.rol === 'admin' ? [{ href: '/admin', icon: <IconSettings size={15} color="#7c3aed" />, label: 'Panel Admin' }] : []),
                      ].map(item => (
                        <Link key={item.href} href={item.href} onClick={() => setDropOpen(false)}
                          style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 16px', color: '#374151', textDecoration: 'none', fontSize: 14, fontWeight: 500, transition: 'background 0.15s' }}
                          onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#f8fafc'}
                          onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}>
                          {item.icon} {item.label}
                        </Link>
                      ))}
                      <div style={{ borderTop: '1px solid #f1f5f9' }} />
                      <button onClick={handleLogout}
                        style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '11px 16px', color: '#ef4444', background: 'none', border: 'none', textAlign: 'left', fontSize: 14, fontWeight: 500, cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif', transition: 'background 0.15s' }}
                        onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#fef2f2'}
                        onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}>
                        <IconLogOut size={15} color="#ef4444" /> Cerrar sesión
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
            background: mobileOpen ? '#eff6ff' : 'transparent', border: '1.5px solid #e2e8f0',
            borderRadius: 10, padding: '8px', cursor: 'pointer', color: '#374151',
            display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s',
          }}>
            {mobileOpen
              ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="3" y1="8" x2="21" y2="8"/><line x1="3" y1="16" x2="21" y2="16"/></svg>
            }
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="mobile-nav animate-slide-down" style={{
          position: 'fixed', top: 64, left: 0, right: 0, bottom: 0, zIndex: 90,
          background: 'white', overflowY: 'auto', display: 'flex', flexDirection: 'column',
        }}>
          {user && (
            <div style={{ padding: '1.25rem 1.5rem', background: '#fafbff', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg, #2563eb, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, color: 'white', fontWeight: 800, flexShrink: 0 }}>
                {(profile?.nombre || user.email || 'U')[0].toUpperCase()}
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 800, fontSize: 15, color: '#0a0f1e', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{profile?.nombre || 'Usuario'}</div>
                <div style={{ fontSize: 12, color: '#94a3b8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.email}</div>
              </div>
              {profile?.rol === 'admin' && <span className="badge badge-blue" style={{ flexShrink: 0 }}>Admin</span>}
            </div>
          )}

          <div style={{ padding: '1rem', flex: 1 }}>
            <p style={{ fontSize: 11, fontWeight: 800, color: '#94a3b8', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '0 8px', marginBottom: 8 }}>Navegación</p>
            {navLinks.map(link => (
              <Link key={link.href} href={link.href} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '12px', borderRadius: 12, fontSize: 15, fontWeight: 600,
                color: isActive(link.href) ? '#2563eb' : '#374151',
                background: isActive(link.href) ? '#eff6ff' : 'transparent',
                textDecoration: 'none', marginBottom: 4,
              }}>
                <span style={{ width: 38, height: 38, borderRadius: 10, background: isActive(link.href) ? '#dbeafe' : '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {link.icon}
                </span>
                <span style={{ flex: 1 }}>{link.label}</span>
                {isActive(link.href) && <IconCheck size={16} color="#2563eb" />}
              </Link>
            ))}

            {user && (
              <>
                <div style={{ height: 1, background: '#f1f5f9', margin: '12px 8px' }} />
                <p style={{ fontSize: 11, fontWeight: 800, color: '#94a3b8', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '0 8px', marginBottom: 8 }}>Mi cuenta</p>
                <Link href="/tiquetes" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px', borderRadius: 12, fontSize: 15, fontWeight: 600, color: '#374151', background: 'transparent', textDecoration: 'none', marginBottom: 4 }}>
                  <span style={{ width: 38, height: 38, borderRadius: 10, background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <IconTicket size={18} color="#2563eb" />
                  </span>
                  Mis Tiquetes
                </Link>
              </>
            )}
          </div>

          <div style={{ padding: '1rem 1.5rem 2rem', borderTop: '1px solid #f1f5f9' }}>
            {user ? (
              <button onClick={handleLogout} style={{
                width: '100%', padding: '13px', background: '#fef2f2',
                border: '1.5px solid #fecaca', borderRadius: 12, color: '#dc2626',
                fontWeight: 800, cursor: 'pointer', fontSize: 15,
                fontFamily: 'Plus Jakarta Sans, sans-serif',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}>
                <IconLogOut size={18} color="#dc2626" /> Cerrar sesión
              </button>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <Link href="/auth/login" className="btn-ghost" style={{ justifyContent: 'center', padding: '13px' }}>Ingresar</Link>
                <Link href="/auth/registro" className="btn-primary" style={{ justifyContent: 'center', padding: '13px' }}>Registrarse</Link>
              </div>
            )}
          </div>
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
