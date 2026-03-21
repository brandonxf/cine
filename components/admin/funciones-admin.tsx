'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Funcion } from '@/lib/supabase/types'
import Link from 'next/link'
import { IconCalendar, IconPlus, IconX, IconEdit, IconTrash, IconArrowLeft, IconCheck } from '@/components/icons'

type PeliculaLite = { id: string; titulo: string }
const EMPTY = { pelicula_id: '', fecha: '', hora: '', precio: '', estado: 'disponible' }

const Label = ({ children }: { children: React.ReactNode }) => (
  <label style={{ fontSize: 12, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 6 }}>{children}</label>
)
const inputStyle = { width: '100%', padding: '10px 14px', background: 'white', border: '1.5px solid #e2e8f0', borderRadius: 10, color: '#0a0f1e', fontSize: 14, outline: 'none', boxSizing: 'border-box' as const, fontFamily: 'Plus Jakarta Sans, sans-serif' }

export function FuncionesAdmin({ funciones: init, peliculas }: { funciones: (Funcion & { peliculas?: { titulo: string } })[]; peliculas: PeliculaLite[] }) {
  const [funciones, setFunciones] = useState(init)
  const [form, setForm] = useState(EMPTY)
  const [editId, setEditId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const supabase = createClient()

  const openAdd = () => { setForm(EMPTY); setEditId(null); setShowForm(true); setError('') }
  const openEdit = (f: Funcion & { peliculas?: { titulo: string } }) => {
    setForm({ pelicula_id: f.pelicula_id, fecha: f.fecha, hora: f.hora.slice(0, 5), precio: String(f.precio), estado: f.estado })
    setEditId(f.id); setShowForm(true); setError('')
  }
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError('')
    const payload = { ...form, precio: parseFloat(form.precio) }
    if (editId) {
      const { data, error: err } = await supabase.from('funciones').update(payload).eq('id', editId).select('*, peliculas(titulo)').single()
      if (err) { setError(err.message); setLoading(false); return }
      setFunciones(prev => prev.map(f => f.id === editId ? data : f))
    } else {
      const { data, error: err } = await supabase.from('funciones').insert(payload).select('*, peliculas(titulo)').single()
      if (err) { setError(err.message); setLoading(false); return }
      setFunciones(prev => [data, ...prev])
    }
    setShowForm(false); setLoading(false)
  }
  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar esta función?')) return
    await supabase.from('funciones').delete().eq('id', id)
    setFunciones(prev => prev.filter(f => f.id !== id))
  }
  const toggleEstado = async (f: Funcion & { peliculas?: { titulo: string } }) => {
    const nuevo = f.estado === 'disponible' ? 'cancelada' : 'disponible'
    await supabase.from('funciones').update({ estado: nuevo }).eq('id', f.id)
    setFunciones(prev => prev.map(x => x.id === f.id ? { ...x, estado: nuevo } : x))
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
            <div style={{ width: 40, height: 40, borderRadius: 12, background: '#f5f3ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <IconCalendar size={20} color="#7c3aed" />
            </div>
            <div>
              <p className="section-title" style={{ marginBottom: 2 }}>Administración</p>
              <h1 style={{ fontSize: 26, fontWeight: 900, color: '#0a0f1e', letterSpacing: '-0.02em' }}>Funciones</h1>
            </div>
          </div>
        </div>
        <button onClick={openAdd} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 20px' }}>
          <IconPlus size={16} color="white" /> Nueva función
        </button>
      </div>

      {/* Modal */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', backdropFilter: 'blur(4px)' }}>
          <div className="card animate-fade-up" style={{ width: '100%', maxWidth: 480, padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontWeight: 900, fontSize: 20, color: '#0a0f1e' }}>{editId ? 'Editar función' : 'Nueva función'}</h2>
              <button onClick={() => setShowForm(false)} style={{ background: '#f1f5f9', border: 'none', borderRadius: 8, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <IconX size={16} color="#64748b" />
              </button>
            </div>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <Label>Película</Label>
                <select value={form.pelicula_id} onChange={e => setForm(p => ({ ...p, pelicula_id: e.target.value }))} required style={inputStyle}>
                  <option value="">Seleccionar película...</option>
                  {peliculas.map(p => <option key={p.id} value={p.id}>{p.titulo}</option>)}
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <Label>Fecha</Label>
                  <input type="date" value={form.fecha} onChange={e => setForm(p => ({ ...p, fecha: e.target.value }))} required style={inputStyle} />
                </div>
                <div>
                  <Label>Hora</Label>
                  <input type="time" value={form.hora} onChange={e => setForm(p => ({ ...p, hora: e.target.value }))} required style={inputStyle} />
                </div>
              </div>
              <div>
                <Label>Precio por asiento (COP)</Label>
                <input type="number" value={form.precio} onChange={e => setForm(p => ({ ...p, precio: e.target.value }))} required min="0" placeholder="15000" style={inputStyle} />
              </div>
              {error && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '10px 14px', color: '#dc2626', fontSize: 13 }}>⚠️ {error}</div>}
              <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                <button type="button" onClick={() => setShowForm(false)} className="btn-ghost" style={{ flex: 1, justifyContent: 'center', padding: '11px' }}>Cancelar</button>
                <button type="submit" disabled={loading} className="btn-primary" style={{ flex: 1, justifyContent: 'center', padding: '11px', opacity: loading ? 0.7 : 1 }}>
                  {loading ? 'Guardando...' : 'Guardar función'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tabla responsive */}
      <div className="card animate-fade-up" style={{ overflow: 'hidden', padding: 0 }}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: 15, fontWeight: 800, color: '#0a0f1e' }}>Todas las funciones</h2>
          <span className="badge badge-blue">{funciones.length} registros</span>
        </div>

        {/* Mobile: cards */}
        <div className="mobile-table">
          {funciones.map((f, i) => (
            <div key={f.id} style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #f8fafc' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 14, color: '#0a0f1e', marginBottom: 4 }}>{f.peliculas?.titulo || '—'}</div>
                  <div style={{ fontSize: 12, color: '#64748b' }}>
                    {f.fecha} · {f.hora.slice(0, 5)} · <strong style={{ color: '#059669' }}>${Number(f.precio).toLocaleString('es-CO')}</strong>
                  </div>
                </div>
                <span className={f.estado === 'disponible' ? 'badge badge-green' : 'badge badge-red'} style={{ fontSize: 10, flexShrink: 0 }}>
                  {f.estado === 'disponible' ? 'Disponible' : 'Cancelada'}
                </span>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => openEdit(f)} className="btn-ghost" style={{ flex: 1, padding: '7px', fontSize: 12, justifyContent: 'center', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <IconEdit size={12} color="#475569" /> Editar
                </button>
                <button onClick={() => toggleEstado(f)} style={{ flex: 1, padding: '7px', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif', background: f.estado === 'disponible' ? '#fef2f2' : '#f0fdf4', color: f.estado === 'disponible' ? '#dc2626' : '#15803d', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                  {f.estado === 'disponible' ? 'Cancelar' : <><IconCheck size={12} color="#15803d" /> Activar</>}
                </button>
                <button onClick={() => handleDelete(f.id)} style={{ padding: '7px 10px', background: '#fef2f2', border: 'none', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                  <IconTrash size={13} color="#dc2626" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop: tabla */}
        <div className="desktop-table" style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 600 }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                {['Película', 'Fecha', 'Hora', 'Precio', 'Estado', 'Acciones'].map(h => (
                  <th key={h} style={{ padding: '11px 16px', textAlign: 'left', fontSize: 11, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', borderBottom: '1px solid #f1f5f9' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {funciones.map(f => (
                <tr key={f.id} style={{ borderBottom: '1px solid #f8fafc', transition: 'background 0.15s' }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#fafbff'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}>
                  <td style={{ padding: '13px 16px', fontSize: 14, fontWeight: 700, color: '#0a0f1e' }}>{f.peliculas?.titulo || '—'}</td>
                  <td style={{ padding: '13px 16px', fontSize: 13, color: '#64748b' }}>{f.fecha}</td>
                  <td style={{ padding: '13px 16px', fontSize: 13, color: '#64748b' }}>{f.hora.slice(0, 5)}</td>
                  <td style={{ padding: '13px 16px', fontSize: 14, fontWeight: 800, color: '#059669' }}>${Number(f.precio).toLocaleString('es-CO')}</td>
                  <td style={{ padding: '13px 16px' }}>
                    <span className={f.estado === 'disponible' ? 'badge badge-green' : 'badge badge-red'} style={{ fontSize: 10 }}>
                      {f.estado === 'disponible' ? 'Disponible' : 'Cancelada'}
                    </span>
                  </td>
                  <td style={{ padding: '13px 16px' }}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button onClick={() => openEdit(f)} style={{ padding: '6px 10px', background: '#f1f5f9', border: 'none', borderRadius: 6, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 600, color: '#374151', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                        <IconEdit size={12} color="#64748b" /> Editar
                      </button>
                      <button onClick={() => toggleEstado(f)} style={{ padding: '6px 10px', background: f.estado === 'disponible' ? '#fef2f2' : '#f0fdf4', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 600, color: f.estado === 'disponible' ? '#dc2626' : '#15803d', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                        {f.estado === 'disponible' ? 'Cancelar' : 'Activar'}
                      </button>
                      <button onClick={() => handleDelete(f.id)} style={{ padding: '6px 8px', background: '#fef2f2', border: 'none', borderRadius: 6, cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                        <IconTrash size={13} color="#dc2626" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {!funciones.length && (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
            <IconCalendar size={32} color="#e2e8f0" style={{ margin: '0 auto 12px', display: 'block' }} />
            <p style={{ fontSize: 14 }}>No hay funciones programadas</p>
          </div>
        )}
      </div>

      <style>{`
        .mobile-table { display: none; }
        .desktop-table { display: block; }
        @media (max-width: 640px) {
          .mobile-table { display: block; }
          .desktop-table { display: none; }
        }
      `}</style>
    </div>
  )
}
