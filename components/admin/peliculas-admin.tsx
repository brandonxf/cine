'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Pelicula } from '@/lib/supabase/types'
import Image from 'next/image'
import Link from 'next/link'
import { IconFilm, IconEdit, IconTrash, IconPlus, IconX, IconArrowLeft, IconCheck } from '@/components/icons'

const EMPTY = { titulo: '', descripcion: '', duracion: '', genero: '', clasificacion: '', imagen_url: '', trailer_url: '', estado: 'activa' }
const GENEROS = ['Accion', 'Animacion', 'Ciencia Ficcion', 'Comedia', 'Drama', 'Terror', 'Romance', 'Suspenso', 'Documental']
const CLASES = ['Todo Publico', '+7', '+13', '+16', '+18']

const Label = ({ children }: { children: React.ReactNode }) => (
  <label style={{ fontSize: 12, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 6 }}>{children}</label>
)
const Input = ({ ...props }) => (
  <input {...props} style={{ width: '100%', padding: '10px 14px', background: 'white', border: '1.5px solid #e2e8f0', borderRadius: 10, color: '#0a0f1e', fontSize: 14, outline: 'none', boxSizing: 'border-box', fontFamily: 'Plus Jakarta Sans, sans-serif', transition: 'border-color 0.2s' }}
    onFocus={e => (e.target as HTMLElement).style.borderColor = '#2563eb'}
    onBlur={e => (e.target as HTMLElement).style.borderColor = '#e2e8f0'} />
)
const Select = ({ children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement> & { children: React.ReactNode }) => (
  <select {...props} style={{ width: '100%', padding: '10px 14px', background: 'white', border: '1.5px solid #e2e8f0', borderRadius: 10, color: '#0a0f1e', fontSize: 14, outline: 'none', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
    {children}
  </select>
)

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
    e.preventDefault(); setLoading(true); setError('')
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
    await supabase.from('peliculas').delete().eq('id', id)
    setPeliculas(prev => prev.filter(p => p.id !== id))
  }
  const toggleEstado = async (p: Pelicula) => {
    const nuevo = p.estado === 'activa' ? 'inactiva' : 'activa'
    await supabase.from('peliculas').update({ estado: nuevo }).eq('id', p.id)
    setPeliculas(prev => prev.map(x => x.id === p.id ? { ...x, estado: nuevo } : x))
  }

  return (
    <div className="page">
      {/* Header */}
      <div className="animate-fade-up" style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <Link href="/admin" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#64748b', textDecoration: 'none', fontSize: 13, fontWeight: 600, marginBottom: 10 }}>
            <IconArrowLeft size={14} color="#64748b" /> Dashboard
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <IconFilm size={20} color="#2563eb" />
            </div>
            <div>
              <p className="section-title" style={{ marginBottom: 2 }}>Administración</p>
              <h1 style={{ fontSize: 26, fontWeight: 900, color: '#0a0f1e', letterSpacing: '-0.02em' }}>Películas</h1>
            </div>
          </div>
        </div>
        <button onClick={openAdd} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 20px' }}>
          <IconPlus size={16} color="white" /> Nueva película
        </button>
      </div>

      {/* Modal */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', backdropFilter: 'blur(4px)' }}>
          <div className="card animate-fade-up" style={{ width: '100%', maxWidth: 540, maxHeight: '92vh', overflowY: 'auto', padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontWeight: 900, fontSize: 20, color: '#0a0f1e' }}>{editId ? 'Editar película' : 'Nueva película'}</h2>
              <button onClick={() => setShowForm(false)} style={{ background: '#f1f5f9', border: 'none', borderRadius: 8, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <IconX size={16} color="#64748b" />
              </button>
            </div>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                { key: 'titulo', label: 'Título', type: 'text', required: true, ph: 'Nombre de la película' },
                { key: 'imagen_url', label: 'URL del póster', type: 'url', required: false, ph: 'https://...' },
                { key: 'trailer_url', label: 'URL del tráiler', type: 'url', required: false, ph: 'https://youtube.com/...' },
                { key: 'duracion', label: 'Duración (minutos)', type: 'number', required: true, ph: '120' },
              ].map(f => (
                <div key={f.key}>
                  <Label>{f.label}</Label>
                  <Input type={f.type} value={form[f.key as keyof typeof form]} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm(p => ({ ...p, [f.key]: e.target.value }))} required={f.required} placeholder={f.ph} />
                </div>
              ))}
              <div>
                <Label>Descripción</Label>
                <textarea value={form.descripcion} onChange={e => setForm(p => ({ ...p, descripcion: e.target.value }))} rows={3} placeholder="Sinopsis de la película..."
                  style={{ width: '100%', padding: '10px 14px', background: 'white', border: '1.5px solid #e2e8f0', borderRadius: 10, color: '#0a0f1e', fontSize: 14, outline: 'none', resize: 'vertical', boxSizing: 'border-box', fontFamily: 'Plus Jakarta Sans, sans-serif' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <Label>Género</Label>
                  <Select value={form.genero} onChange={e => setForm(p => ({ ...p, genero: e.target.value }))} required>
                    <option value="">Seleccionar</option>
                    {GENEROS.map(g => <option key={g}>{g}</option>)}
                  </Select>
                </div>
                <div>
                  <Label>Clasificación</Label>
                  <Select value={form.clasificacion} onChange={e => setForm(p => ({ ...p, clasificacion: e.target.value }))} required>
                    <option value="">Seleccionar</option>
                    {CLASES.map(c => <option key={c}>{c}</option>)}
                  </Select>
                </div>
              </div>
              {error && (
                <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '10px 14px', color: '#dc2626', fontSize: 13 }}>
                  ⚠️ {error}
                </div>
              )}
              <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                <button type="button" onClick={() => setShowForm(false)} className="btn-ghost" style={{ flex: 1, justifyContent: 'center', padding: '11px' }}>Cancelar</button>
                <button type="submit" disabled={loading} className="btn-primary" style={{ flex: 1, justifyContent: 'center', padding: '11px', opacity: loading ? 0.7 : 1 }}>
                  {loading ? 'Guardando...' : 'Guardar película'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Grid de películas */}
      {!peliculas.length ? (
        <div className="card" style={{ padding: '4rem', textAlign: 'center' }}>
          <div style={{ width: 64, height: 64, borderRadius: 20, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <IconFilm size={28} color="#2563eb" />
          </div>
          <h3 style={{ fontSize: 17, fontWeight: 800, color: '#0a0f1e', marginBottom: 8 }}>No hay películas</h3>
          <p style={{ color: '#64748b', marginBottom: 20, fontSize: 14 }}>Agrega la primera película a la cartelera</p>
          <button onClick={openAdd} className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 20px' }}>
            <IconPlus size={16} color="white" /> Agregar película
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
          {peliculas.map((p, i) => (
            <div key={p.id} className={`card animate-fade-up delay-${Math.min(i + 1, 5)}`} style={{ overflow: 'hidden', padding: 0 }}>
              {/* Imagen */}
              <div style={{ position: 'relative', aspectRatio: '16/9', background: '#f1f5f9' }}>
                {p.imagen_url
                  ? <Image src={p.imagen_url} alt={p.titulo} fill style={{ objectFit: 'cover' }} unoptimized />
                  : <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}><IconFilm size={32} color="#cbd5e1" /></div>
                }
                <div style={{ position: 'absolute', top: 8, right: 8 }}>
                  <span className={p.estado === 'activa' ? 'badge badge-green' : 'badge badge-gray'} style={{ fontSize: 10 }}>
                    {p.estado === 'activa' ? 'Activa' : 'Inactiva'}
                  </span>
                </div>
              </div>
              {/* Info */}
              <div style={{ padding: '1rem' }}>
                <h3 style={{ fontWeight: 800, fontSize: 15, color: '#0a0f1e', marginBottom: 8, lineHeight: 1.3 }}>{p.titulo}</h3>
                <div style={{ display: 'flex', gap: 6, marginBottom: 14, flexWrap: 'wrap' }}>
                  <span className="badge badge-blue" style={{ fontSize: 10 }}>{p.genero}</span>
                  <span className="badge badge-gray" style={{ fontSize: 10 }}>{p.duracion} min</span>
                  <span className="badge badge-amber" style={{ fontSize: 10 }}>{p.clasificacion}</span>
                </div>
                {/* Acciones */}
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => openEdit(p)} className="btn-ghost" style={{ flex: 1, padding: '8px', fontSize: 13, justifyContent: 'center', display: 'flex', alignItems: 'center', gap: 5 }}>
                    <IconEdit size={13} color="#475569" /> Editar
                  </button>
                  <button onClick={() => toggleEstado(p)} style={{
                    flex: 1, padding: '8px', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif',
                    background: p.estado === 'activa' ? '#f1f5f9' : '#d1fae5',
                    color: p.estado === 'activa' ? '#64748b' : '#065f46',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                  }}>
                    {p.estado === 'activa' ? 'Pausar' : <><IconCheck size={13} color="#065f46" /> Activar</>}
                  </button>
                  <button onClick={() => handleDelete(p.id, p.titulo)} style={{ padding: '8px 10px', background: '#fef2f2', border: 'none', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <IconTrash size={14} color="#dc2626" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
