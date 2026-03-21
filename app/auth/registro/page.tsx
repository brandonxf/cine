'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function RegistroPage() {
  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setError('')
    const { error } = await supabase.auth.signUp({ email, password, options: { data: { nombre } } })
    if (error) { setError(error.message); setLoading(false) }
    else router.push('/')
  }

  return (
    <div style={{ minHeight: '85vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }} className="hero-bg">
      <div className="animate-fade-up card" style={{ width: '100%', maxWidth: 420, padding: '2.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16, margin: '0 auto 16px',
            background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26,
            boxShadow: '0 8px 24px rgba(37,99,235,0.3)',
          }}>🎟️</div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0a0f1e', letterSpacing: '-0.02em', marginBottom: 6 }}>Crear cuenta</h1>
          <p style={{ color: '#64748b', fontSize: 14 }}>Regístrate y empieza a disfrutar</p>
        </div>

        <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {[
            { key: 'nombre', label: 'Nombre completo', type: 'text', val: nombre, set: setNombre, ph: 'Tu nombre' },
            { key: 'email', label: 'Correo electrónico', type: 'email', val: email, set: setEmail, ph: 'tu@email.com' },
            { key: 'pass', label: 'Contraseña (mín. 6 caracteres)', type: 'password', val: password, set: setPassword, ph: '••••••••' },
          ].map(f => (
            <div key={f.key}>
              <label style={{ fontSize: 13, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 6 }}>{f.label}</label>
              <input className="input" type={f.type} value={f.val} onChange={e => f.set(e.target.value)} required placeholder={f.ph} minLength={f.key === 'pass' ? 6 : undefined} />
            </div>
          ))}

          {error && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '10px 14px', color: '#dc2626', fontSize: 13 }}>
              ⚠️ {error}
            </div>
          )}

          <button type="submit" disabled={loading} className="btn-primary" style={{ padding: '13px', fontSize: 15, marginTop: 4, width: '100%', justifyContent: 'center', opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Creando cuenta...' : 'Crear cuenta'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: 14, color: '#64748b' }}>
          ¿Ya tienes cuenta?{' '}
          <Link href="/auth/login" style={{ color: '#2563eb', fontWeight: 700, textDecoration: 'none' }}>Inicia sesión</Link>
        </p>
      </div>
    </div>
  )
}
