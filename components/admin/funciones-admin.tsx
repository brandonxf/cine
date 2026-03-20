'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Funcion } from '@/lib/supabase/types'
import Link from 'next/link'

type PeliculaLite = { id: string; titulo: string }
const EMPTY = { pelicula_id: '', fecha: '', hora: '', precio: '', estado: 'disponible' }

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
    e.preventDefault()
    setLoading(true); setError('')
    const payload = { ...form, precio: parseFloat(form.precio) }
    const pelicula = peliculas.find(p => p.id === form.pelicula_id)
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
    if (!confirm('Eliminar esta funcion?')) return
    await supabase.from('funciones').delete().eq('id', id)
    setFunciones(prev => prev.filter(f => f.id !== id))
  }

  const toggleEstado = async (f: Funcion & { peliculas?: { titulo: string } }) => {
    const nuevo = f.estado === 'disponible' ? 'cancelada' : 'disponible'
    await supabase.from('funciones').update({ estado: nuevo }).eq('id', f.id)
    setFunciones(prev => prev.map(x => x.id === f.id ? { ...x, estado: nuevo } : x))
  }

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '2rem 1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <Link href="/admin" style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none', fontSize: 13 }}>← Admin</Link>
          <h1 style={{ fontSize: 26, fontWeight: 800, marginTop: 4 }}>Funciones</h1>
        </div>
        <button onClick={openAdd} style={{ background: '#f97316', color: 'white', border: 'none', borderRadius: 10, padding: '10px 20px', fontWeight: 700, cursor: 'pointer', fontSize: 14 }}>+ Nueva funcion</button>
      </div>

      {/* Modal */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ background: '#12121e', borderRadius: 20, padding: '2rem', width: '100%', maxWidth: 480, border: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <h2 style={{ fontWeight: 800, fontSize: 20 }}>{editId ? 'Editar funcion' : 'Nueva funcion'}</h2>
              <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: 20 }}>✕</button>
            </div>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.6)', display: 'block', marginBottom: 6 }}>Pelicula</label>
                <select value={form.pelicula_id} onChange={e => setForm(p => ({ ...p, pelicula_id: e.target.value }))} required
                  style={{ width: '100%', padding: '10px 14px', background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, color: 'white', fontSize: 14, outline: 'none' }}>
                  <option value="">Seleccionar pelicula</option>
                  {peliculas.map(p => <option key={p.id} value={p.id}>{p.titulo}</option>)}
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.6)', display: 'block', marginBottom: 6 }}>Fecha</label>
                  <input type="date" value={form.fecha} onChange={e => setForm(p => ({ ...p, fecha: e.target.value }))} required
                    style={{ width: '100%', padding: '10px 14px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, color: 'white', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.6)', display: 'block', marginBottom: 6 }}>Hora</label>
                  <input type="time" value={form.hora} onChange={e => setForm(p => ({ ...p, hora: e.target.value }))} required
                    style={{ width: '100%', padding: '10px 14px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, color: 'white', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
                </div>
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.6)', display: 'block', marginBottom: 6 }}>Precio por asiento (COP)</label>
                <input type="number" value={form.precio} onChange={e => setForm(p => ({ ...p, precio: e.target.value }))} required min="0"
                  placeholder="15000"
                  style={{ width: '100%', padding: '10px 14px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, color: 'white', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
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

      {/* Tabla */}
      <div style={{ background: '#12121e', borderRadius: 16, border: '1px solid rgba(255,255,255,0.08)', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 600 }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.04)' }}>
                {['Pelicula', 'Fecha', 'Hora', 'Precio', 'Estado', 'Acciones'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {funciones.map((f, i) => (
                <tr key={f.id} style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)' }}>
                  <td style={{ padding: '12px 16px', fontSize: 14, fontWeight: 600 }}>{f.peliculas?.titulo || '-'}</td>
                  <td style={{ padding: '12px 16px', fontSize: 14, color: 'rgba(255,255,255,0.7)' }}>{f.fecha}</td>
                  <td style={{ padding: '12px 16px', fontSize: 14, color: 'rgba(255,255,255,0.7)' }}>{f.hora.slice(0,5)}</td>
                  <td style={{ padding: '12px 16px', fontSize: 14, color: '#f97316', fontWeight: 700 }}>${Number(f.precio).toLocaleString('es-CO')}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: f.estado === 'disponible' ? '#10b981' : '#ef4444', background: f.estado === 'disponible' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', padding: '3px 10px', borderRadius: 6, textTransform: 'uppercase' }}>{f.estado}</span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button onClick={() => openEdit(f)} style={{ padding: '5px 10px', background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: 6, color: 'white', fontSize: 12, cursor: 'pointer' }}>Editar</button>
                      <button onClick={() => toggleEstado(f)} style={{ padding: '5px 10px', background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: 6, color: 'rgba(255,255,255,0.7)', fontSize: 12, cursor: 'pointer' }}>
                        {f.estado === 'disponible' ? 'Cancelar' : 'Activar'}
                      </button>
                      <button onClick={() => handleDelete(f.id)} style={{ padding: '5px 10px', background: 'rgba(239,68,68,0.1)', border: 'none', borderRadius: 6, color: '#ef4444', fontSize: 12, cursor: 'pointer' }}>🗑</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!funciones.length && (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'rgba(255,255,255,0.4)' }}>
            <div style={{ fontSize: 36, marginBottom: 8 }}>📅</div>
            <p>No hay funciones programadas</p>
          </div>
        )}
      </div>
    </div>
  )
}
