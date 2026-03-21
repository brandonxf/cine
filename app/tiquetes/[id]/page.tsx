import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'

export default async function TiquetePage({ params, searchParams }: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ nuevo?: string }>
}) {
  const { id } = await params
  const { nuevo } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: tiquete } = await supabase
    .from('tiquetes').select('*, funciones(*, peliculas(*))').eq('id', id).single()
  if (!tiquete) return notFound()

  const { data: detalle } = await supabase
    .from('detalle_tiquete').select('*, asientos(*)').eq('tiquete_id', id)

  const fecha = new Date(tiquete.funciones?.fecha + 'T12:00:00')
    .toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  const compra = new Date(tiquete.fecha_compra).toLocaleString('es-CO')
  const asientos = (detalle || [])
    .map((d: { asientos?: { fila: string; columna: number } }) => d.asientos ? `${d.asientos.fila}${d.asientos.columna}` : '')
    .filter(Boolean).join(', ')

  const estadoCfg: Record<string, { cls: string; label: string; bg: string; color: string }> = {
    activo:    { cls: 'badge-blue',  label: 'Activo',    bg: '#eff6ff', color: '#2563eb' },
    usado:     { cls: 'badge-gray',  label: 'Usado',     bg: '#f1f5f9', color: '#475569' },
    cancelado: { cls: 'badge-red',   label: 'Cancelado', bg: '#fef2f2', color: '#dc2626' },
  }
  const cfg = estadoCfg[tiquete.estado] || estadoCfg.usado

  return (
    <div style={{ maxWidth: 560, margin: '0 auto', padding: '2rem 1.5rem' }}>

      {/* Éxito banner */}
      {nuevo === '1' && (
        <div className="animate-fade-up" style={{
          background: '#f0fdf4', border: '1.5px solid #bbf7d0', borderRadius: 14,
          padding: '1rem 1.25rem', marginBottom: '1.5rem',
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>✅</div>
          <div>
            <div style={{ fontWeight: 800, color: '#15803d', fontSize: 14 }}>¡Compra exitosa!</div>
            <div style={{ fontSize: 13, color: '#16a34a', marginTop: 1 }}>Tu tiquete ha sido generado correctamente</div>
          </div>
        </div>
      )}

      {/* Ticket card */}
      <div className="animate-fade-up card" style={{ overflow: 'hidden', padding: 0 }}>

        {/* Header azul */}
        <div style={{
          background: 'linear-gradient(135deg, #1e40af, #2563eb, #7c3aed)',
          padding: '2rem', textAlign: 'center', position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', top: -30, right: -30, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
          <div style={{ position: 'absolute', bottom: -40, left: -20, width: 150, height: 150, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />
          <div style={{ position: 'relative' }}>
            <div style={{ width: 52, height: 52, borderRadius: 16, background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, margin: '0 auto 12px' }}>🎬</div>
            <h1 style={{ fontSize: 20, fontWeight: 900, color: 'white', marginBottom: 8, lineHeight: 1.2 }}>
              {tiquete.funciones?.peliculas?.titulo}
            </h1>
            <span style={{ fontSize: 11, fontWeight: 800, color: cfg.color, background: cfg.bg, padding: '4px 12px', borderRadius: 20, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              {cfg.label}
            </span>
          </div>
        </div>

        {/* Separador dentado */}
        <div style={{ position: 'relative', height: 20, background: 'white' }}>
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: 'radial-gradient(circle at 0 50%, #f0f4ff 10px, white 10px), radial-gradient(circle at 100% 50%, #f0f4ff 10px, white 10px)',
            backgroundSize: '20px 20px', backgroundRepeat: 'no-repeat',
          }} />
          <div style={{ position: 'absolute', top: '50%', left: 20, right: 20, height: 1, borderTop: '2px dashed #e2e8f0' }} />
        </div>

        {/* QR */}
        <div style={{ padding: '1.5rem', textAlign: 'center', background: 'white' }}>
          <div style={{
            display: 'inline-block', padding: '1rem', background: 'white',
            borderRadius: 16, border: '2px solid #e2e8f0', marginBottom: 12,
          }}>
            <div style={{ width: 110, height: 110, background: 'repeating-conic-gradient(#0a0f1e 0% 25%, white 0% 50%) 0 0 / 11px 11px', borderRadius: 6 }} />
          </div>
          <div style={{ fontFamily: 'monospace', fontSize: 20, fontWeight: 900, color: '#2563eb', letterSpacing: '0.12em' }}>
            {tiquete.codigo}
          </div>
          <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 6, fontWeight: 600 }}>Presenta este código al ingresar a la sala</p>
        </div>

        {/* Separador dentado */}
        <div style={{ position: 'relative', height: 20, background: 'white' }}>
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at 0 50%, #f0f4ff 10px, white 10px), radial-gradient(circle at 100% 50%, #f0f4ff 10px, white 10px)', backgroundSize: '20px 20px', backgroundRepeat: 'no-repeat' }} />
          <div style={{ position: 'absolute', top: '50%', left: 20, right: 20, height: 1, borderTop: '2px dashed #e2e8f0' }} />
        </div>

        {/* Detalles */}
        <div style={{ padding: '1.5rem', background: 'white' }}>
          {[
            { icon: '📅', label: 'Fecha', value: fecha },
            { icon: '🕐', label: 'Hora', value: tiquete.funciones?.hora?.slice(0, 5) },
            { icon: '💺', label: 'Asientos', value: asientos || '—' },
            { icon: '💰', label: 'Total pagado', value: `$${Number(tiquete.total).toLocaleString('es-CO')} COP` },
            { icon: '🗓️', label: 'Fecha de compra', value: compra },
          ].map(({ icon, label, value }) => (
            <div key={label} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
              padding: '11px 0', borderBottom: '1px solid #f8fafc',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 14 }}>{icon}</span>
                <span style={{ fontSize: 13, color: '#64748b', fontWeight: 600 }}>{label}</span>
              </div>
              <span style={{ fontSize: 13, fontWeight: 800, color: '#0a0f1e', textAlign: 'right', maxWidth: '55%' }}>{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Botones */}
      <div className="animate-fade-up delay-2" style={{ display: 'flex', gap: 10, marginTop: '1.25rem' }}>
        <Link href="/tiquetes" className="btn-ghost" style={{ flex: 1, justifyContent: 'center', padding: '12px' }}>
          ← Mis tiquetes
        </Link>
        <Link href="/" className="btn-primary" style={{ flex: 1, justifyContent: 'center', padding: '12px' }}>
          Ver cartelera
        </Link>
      </div>
    </div>
  )
}
