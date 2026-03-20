'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import type { Profile } from '@/lib/supabase/types'

export function Navbar() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [open, setOpen] = useState(false)
  const supabase = createClient()

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
      if (!session?.user) setProfile(null)
    })
    return () => subscription.unsubscribe()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setOpen(false)
    window.location.href = '/'
  }

  return (
    <nav style={{
      background: 'rgba(8,8,20,0.95)',
      borderBottom: '1px solid rgba(255,255,255,0.08)',
      backdropFilter: 'blur(12px)',
      position: 'sticky', top: 0, zIndex: 50,
      padding: '0 1.5rem',
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
          <span style={{ fontSize: 24 }}>🎬</span>
          <span style={{ fontWeight: 800, fontSize: 20, color: '#f97316', letterSpacing: '-0.5px' }}>CineApp</span>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Link href="/" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', padding: '8px 12px', borderRadius: 8, fontSize: 14, fontWeight: 500 }}>Cartelera</Link>
          <Link href="/validar" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', padding: '8px 12px', borderRadius: 8, fontSize: 14, fontWeight: 500 }}>Validar</Link>

          {user ? (
            <div style={{ position: 'relative' }}>
              <button onClick={() => setOpen(!open)} style={{
                background: 'rgba(249,115,22,0.15)', border: '1px solid rgba(249,115,22,0.3)',
                borderRadius: 8, padding: '8px 14px', color: '#f97316', fontSize: 14,
                fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
              }}>
                <span>👤</span>
                <span>{profile?.nombre?.split(' ')[0] || 'Usuario'}</span>
                <span style={{ fontSize: 10 }}>{open ? '▲' : '▼'}</span>
              </button>
              {open && (
                <div style={{
                  position: 'absolute', right: 0, top: 'calc(100% + 8px)',
                  background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 12, minWidth: 180, overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                }}>
                  <Link href="/tiquetes" onClick={() => setOpen(false)} style={{ display: 'block', padding: '12px 16px', color: 'rgba(255,255,255,0.8)', textDecoration: 'none', fontSize: 14 }}>🎟️ Mis Tiquetes</Link>
                  {profile?.rol === 'admin' && (
                    <Link href="/admin" onClick={() => setOpen(false)} style={{ display: 'block', padding: '12px 16px', color: 'rgba(255,255,255,0.8)', textDecoration: 'none', fontSize: 14 }}>⚙️ Admin</Link>
                  )}
                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }} />
                  <button onClick={handleLogout} style={{ display: 'block', width: '100%', padding: '12px 16px', color: '#ef4444', background: 'none', border: 'none', textAlign: 'left', fontSize: 14, cursor: 'pointer' }}>🚪 Cerrar sesión</button>
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 8 }}>
              <Link href="/auth/login" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', padding: '8px 14px', borderRadius: 8, fontSize: 14, fontWeight: 500 }}>Ingresar</Link>
              <Link href="/auth/registro" style={{
                background: '#f97316', color: 'white', textDecoration: 'none',
                padding: '8px 16px', borderRadius: 8, fontSize: 14, fontWeight: 600,
              }}>Registrarse</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
