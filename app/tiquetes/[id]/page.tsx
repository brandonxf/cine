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
    .from('tiquetes')
    .select('*, funciones(*, peliculas(*))')
    .eq('id', id)
    .single()

  if (!tiquete) return notFound()

  const { data: detalle } = await supabase
    .from('detalle_tiquete')
    .select('*, asientos(*)')
    .eq('tiquete_id', id)

  const fecha = new Date(tiquete.funciones?.fecha + 'T12:00:00')
  const fechaStr = fecha.toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  const compra = new Date(tiquete.fecha_compra).toLocaleString('es-CO')

  const statusColor: Record<string, string> = { activo: '#10b981', usado: '#6b7280', cancelado: '#ef4444' }

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: '2rem 1.5rem' }}>
      {nuevo === '1' && (
        <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 12, padding: '1rem 1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 24 }}>✅</span>
          <div>
            <div style={{ fontWeight: 700, color: '#10b981' }}>Compra exitosa</div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>Tu tiquete ha sido generado</div>
          </div>
        </div>
      )}

      <div style={{ background: '#12121e', borderRadius: 20, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)' }}>
        {/* Header */}
        <div style={{ background: 'linear-gradient(135deg, #1a0a00, #2d1000)', padding: '2rem', textAlign: 'center', borderBottom: '2px dashed rgba(255,255,255,0.08)' }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>🎬</div>
          <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>{tiquete.funciones?.peliculas?.titulo}</h1>
          <span style={{ fontSize: 12, fontWeight: 700, color: statusColor[tiquete.estado], background: `${statusColor[tiquete.estado]}20`, padding: '3px 10px', borderRadius: 6, textTransform: 'uppercase' }}>{tiquete.estado}</span>
        </div>

        {/* Codigo QR simulado */}
        <div style={{ padding: '2rem', textAlign: 'center', borderBottom: '2px dashed rgba(255,255,255,0.08)' }}>
          <div style={{ background: 'white', borderRadius: 12, padding: '1.5rem', display: 'inline-block', marginBottom: 12 }}>
            <div style={{ width: 120, height: 120, background: 'repeating-conic-gradient(#000 0% 25%, #fff 0% 50%) 0 0 / 12px 12px', borderRadius: 4 }} />
          </div>
          <div style={{ fontFamily: 'monospace', fontSize: 18, fontWeight: 800, letterSpacing: '0.1em', color: '#f97316' }}>{tiquete.codigo}</div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>Presenta este codigo al ingresar</div>
        </div>

        {/* Detalles */}
        <div style={{ padding: '1.5rem' }}>
          {[
            { label: 'Fecha', value: fechaStr },
            { label: 'Hora', value: tiquete.funciones?.hora?.slice(0,5) },
            { label: 'Asientos', value: (detalle || []).map((d: { asientos?: { fila: string, columna: number } }) => d.asientos ? `${d.asientos.fila}${d.asientos.columna}` : '').join(', ') },
            { label: 'Total pagado', value: `$${Number(tiquete.total).toLocaleString('es-CO')}` },
            { label: 'Fecha de compra', value: compra },
          ].map(({ label, value }) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14 }}>{label}</span>
              <span style={{ fontWeight: 600, fontSize: 14, textAlign: 'right', maxWidth: '60%' }}>{value}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12, marginTop: '1.5rem' }}>
        <Link href="/tiquetes" style={{ flex: 1, textAlign: 'center', padding: '12px', background: 'rgba(255,255,255,0.08)', borderRadius: 12, color: 'white', textDecoration: 'none', fontWeight: 600, fontSize: 14 }}>Mis tiquetes</Link>
        <Link href="/" style={{ flex: 1, textAlign: 'center', padding: '12px', background: '#f97316', borderRadius: 12, color: 'white', textDecoration: 'none', fontWeight: 700, fontSize: 14 }}>Ver cartelera</Link>
      </div>
    </div>
  )
}
