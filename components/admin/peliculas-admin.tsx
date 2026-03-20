'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Pelicula } from '@/lib/supabase/types'
import Image from 'next/image'
import Link from 'next/link'

const EMPTY = { titulo: '', descripcion: '', duracion: '', genero: '', clasificacion: '', imagen_url: '', trailer_url: '', estado: 'activa' }
const GENEROS = ['Accion', 'Animacion', 'Ciencia Ficcion', 'Comedia', 'Drama', 'Terror', 'Romance', 'Suspenso', 'Documental']
const CLASES = ['Todo Publico', '+7', '+13', '+16', '+18']

export function PeliculasAdmin({ peliculas: init }: { peliculas: Pelicula[] }) {
  const [peliculas, setPeliculas] = useState<Pelicula[]>(init)
  const [form, setForm] = useState(EMPTY)
  const [editId, setEditId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const supabase = createClient()

  const openAdd = () => { setForm(EMPTY); setEditId(null); setShowForm(true); setError('') }
  const openEdit = (p: Pelicula) => {
    setForm({ titulo: p.titulo, descripcion: p.descripcion || '', duracion: String(p.duracion), genero: p.genero, clasificacion: p.clasificacion, imagen_url: p.imagen_url || '', trailer_url: p.trailer_url || '', estado: p.estado })
    setEditId(p.id); setShowForm(true); setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setError('')
    const payload = { ...form, duracion: parseInt(form.duracion) }
    if (editId) {
      const { data, error: err } = await supabase.from('peliculas').update(payload).eq('id', editId).select().single()
      if (err) { setError(err.message); setLoading(false); return }
      setPeliculas(prev => prev.map(p => p.id === editId ? data : p))
    } else {
      const { data, error: err } = await supabase.from('peliculas').insert(payload).select().single()
      if (err) { setError(err.message); setLoading(false); return }
      setPeliculas(prev => [data, ...prev])
    }
    setShowForm(false); setLoading(false)
  }

  const handleDelete = async (id: string, titulo: string) => {
    if (!confirm(`Eliminar "${titulo}"?`)) return
    const { error: err } = await supabase.from('peliculas').delete().eq('id', id)
    if (!err) setPeliculas(prev => prev.filter(p => p.id !== id))
  }

  const toggleEstado = async (p: Pelicula) => {
    const nuevo = p.estado === 'activa' ? 'inactiva' : 'activa'
    await supabase.from('peliculas').update({ estado: nuevo }).eq('id', p.id)
    setPeliculas(prev => prev.map(x => x.id === p.id ? { ...x, estado: nuevo } : x))
  }

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '2rem 1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <Link href="/admin" style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none', fontSize: 13 }}>← Admin</Link>
          <h1 style={{ fontSize: 26, fontWeight: 800, marginTop: 4 }}>Peliculas</h1>
        </div>
        <button onClick={openAdd} style={{ background: '#f97316', color: 'white', border: 'none', borderRadius: 10, padding: '10px 20px', fontWeight: 700, cursor: 'pointer', fontSize: 14 }}>
          + Nueva pelicula
        </button>
      </div>

      {/* Modal Form */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ background: '#12121e', borderRadius: 20, padding: '2rem', width: '100%', maxWidth: 560, maxHeight: '90vh', overflowY: 'auto', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <h2 style={{ fontWeight: 800, fontSize: 20 }}>{editId ? 'Editar pelicula' : 'Nueva pelicula'}</h2>
              <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: 20 }}>✕</button>
            </div>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                { key: 'titulo', label: 'Titulo', type: 'text', required: true },
                { key: 'imagen_url', label: 'URL imagen (poster)', type: 'url', required: false },
                { key: 'trailer_url', label: 'URL trailer', type: 'url', required: false },
                { key: 'duracion', label: 'Duracion (minutos)', type: 'number', required: true },
              ].map(({ key, label, type, required }) => (
                <div key={key}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.6)', display: 'block', marginBottom: 6 }}>{label}</label>
                  <input type={type} value={form[key as keyof typeof form]} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))} required={required}
                    style={{ width: '100%', padding: '10px 14px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, color: 'white', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
                </div>
              ))}
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.6)', display: 'block', marginBottom: 6 }}>Descripcion</label>
                <textarea value={form.descripcion} onChange={e => setForm(p => ({ ...p, descripcion: e.target.value }))} rows={3}
                  style={{ width: '100%', padding: '10px 14px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, color: 'white', fontSize: 14, outline: 'none', resize: 'vertical', boxSizing: 'border-box' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.6)', display: 'block', marginBottom: 6 }}>Genero</label>
                  <select value={form.genero} onChange={e => setForm(p => ({ ...p, genero: e.target.value }))} required
                    style={{ width: '100%', padding: '10px 14px', background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, color: 'white', fontSize: 14, outline: 'none' }}>
                    <option value="">Seleccionar</option>
                    {GENEROS.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.6)', display: 'block', marginBottom: 6 }}>Clasificacion</label>
                  <select value={form.clasificacion} onChange={e => setForm(p => ({ ...p, clasificacion: e.target.value }))} required
                    style={{ width: '100%', padding: '10px 14px', background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, color: 'white', fontSize: 14, outline: 'none' }}>
                    <option value="">Seleccionar</option>
                    {CLASES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              {error && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, padding: '10px 14px', color: '#ef4444', fontSize: 13 }}>{error}</div>}
              <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                <button type="button" onClick={() => setShowForm(false)} style={{ flex: 1, padding: '11px', background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: 10, color: 'white', fontWeight: 600, cursor: 'pointer' }}>Cancelar</button>
                <button type="submit" disabled={loading} style={{ flex: 1, padding: '11px', background: '#f97316', border: 'none', borderRadius: 10, color: 'white', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}>
                  {loading ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lista */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
        {peliculas.map(p => (
          <div key={p.id} style={{ background: '#12121e', borderRadius: 16, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ position: 'relative', aspectRatio: '16/9', background: '#1a1a2e' }}>
              {p.imagen_url && <Image src={p.imagen_url} alt={p.titulo} fill style={{ objectFit: 'cover' }} unoptimized />}
              <div style={{ position: 'absolute', top: 8, right: 8, background: p.estado === 'activa' ? 'rgba(16,185,129,0.9)' : 'rgba(107,114,128,0.9)', borderRadius: 6, padding: '2px 8px', fontSize: 11, fontWeight: 700 }}>
                {p.estado === 'activa' ? 'ACTIVA' : 'INACTIVA'}
              </div>
            </div>
            <div style={{ padding: '1rem' }}>
              <h3 style={{ fontWeight: 700, fontSize: 15, marginBottom: 6 }}>{p.titulo}</h3>
              <div style={{ display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', background: 'rgba(255,255,255,0.06)', padding: '2px 8px', borderRadius: 4 }}>{p.genero}</span>
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', background: 'rgba(255,255,255,0.06)', padding: '2px 8px', borderRadius: 4 }}>{p.duracion} min</span>
                <span style={{ fontSize: 11, color: '#f97316', background: 'rgba(249,115,22,0.1)', padding: '2px 8px', borderRadius: 4 }}>{p.clasificacion}</span>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => openEdit(p)} style={{ flex: 1, padding: '8px', background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: 8, color: 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Editar</button>
                <button onClick={() => toggleEstado(p)} style={{ flex: 1, padding: '8px', background: p.estado === 'activa' ? 'rgba(107,114,128,0.2)' : 'rgba(16,185,129,0.2)', border: 'none', borderRadius: 8, color: p.estado === 'activa' ? '#9ca3af' : '#10b981', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                  {p.estado === 'activa' ? 'Desactivar' : 'Activar'}
                </button>
                <button onClick={() => handleDelete(p.id, p.titulo)} style={{ padding: '8px 12px', background: 'rgba(239,68,68,0.15)', border: 'none', borderRadius: 8, color: '#ef4444', fontSize: 13, cursor: 'pointer' }}>🗑</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {!peliculas.length && (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'rgba(255,255,255,0.4)' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🎬</div>
          <p>No hay peliculas. Agrega la primera.</p>
        </div>
      )}
    </div>
  )
}
