import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { IconFilm, IconCalendar, IconClock, IconSeat, IconMoney, IconCheck, IconQr, IconArrowLeft, IconArrowRight } from '@/components/icons'

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
    activo:    { cls: 'badge-blue', label: 'Activo',    bg: '#eff6ff', color: '#2563eb' },
    usado:     { cls: 'badge-gray', label: 'Usado',     bg: '#f1f5f9', color: '#475569' },
    cancelado: { cls: 'badge-red',  label: 'Cancelado', bg: '#fef2f2', color: '#dc2626' },
  }
  const cfg = estadoCfg[tiquete.estado] || estadoCfg.usado

  const rows = [
    { icon: <IconCalendar size={15} color="#2563eb" />, label: 'Fecha', value: fecha },
    { icon: <IconClock size={15} color="#2563eb" />, label: 'Hora', value: tiquete.funciones?.hora?.slice(0, 5) },
    { icon: <IconSeat size={15} color="#2563eb" />, label: 'Asientos', value: asientos || '—' },
    { icon: <IconMoney size={15} color="#059669" />, label: 'Total pagado', value: `$${Number(tiquete.total).toLocaleString('es-CO')} COP` },
    { icon: <IconCalendar size={15} color="#94a3b8" />, label: 'Fecha de compra', value: compra },
  ]

  return (
    <div style={{ maxWidth: 540, margin: '0 auto', padding: '2rem 1.5rem' }}>

      {/* Éxito */}
      {nuevo === '1' && (
        <div className="animate-fade-up" style={{ background: '#f0fdf4', border: '1.5px solid #bbf7d0', borderRadius: 14, padding: '1rem 1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <IconCheck size={20} color="#15803d" />
          </div>
          <div>
            <div style={{ fontWeight: 800, color: '#15803d', fontSize: 14 }}>¡Compra exitosa!</div>
            <div style={{ fontSize: 13, color: '#16a34a', marginTop: 1 }}>Tu tiquete ha sido generado correctamente</div>
          </div>
        </div>
      )}

      {/* Ticket */}
      <div className="animate-fade-up card" style={{ overflow: 'hidden', padding: 0 }}>

        {/* Header */}
        <div style={{ background: 'linear-gradient(135deg, #1e40af, #2563eb, #7c3aed)', padding: '2rem', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -30, right: -30, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
          <div style={{ position: 'absolute', bottom: -40, left: -20, width: 150, height: 150, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />
          <div style={{ position: 'relative' }}>
            <div style={{ width: 52, height: 52, borderRadius: 16, background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
              <IconFilm size={26} color="white" />
            </div>
            <h1 style={{ fontSize: 20, fontWeight: 900, color: 'white', marginBottom: 10, lineHeight: 1.2 }}>
              {tiquete.funciones?.peliculas?.titulo}
            </h1>
            <span style={{ fontSize: 11, fontWeight: 800, color: cfg.color, background: cfg.bg, padding: '4px 14px', borderRadius: 20, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {cfg.label}
            </span>
          </div>
        </div>

        {/* Separador dentado */}
        <div style={{ position: 'relative', height: 20, background: 'white' }}>
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at 0 50%, #f0f4ff 10px, white 10px), radial-gradient(circle at 100% 50%, #f0f4ff 10px, white 10px)', backgroundSize: '20px 20px', backgroundRepeat: 'no-repeat' }} />
          <div style={{ position: 'absolute', top: '50%', left: 20, right: 20, height: 1, borderTop: '2px dashed #e2e8f0' }} />
        </div>

        {/* QR */}
        <div style={{ padding: '1.75rem', textAlign: 'center', background: 'white' }}>
          <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: '1.25rem', background: '#fafbff', borderRadius: 16, border: '1.5px solid #e2e8f0', marginBottom: 14 }}>
            <IconQr size={24} color="#94a3b8" style={{ marginBottom: 8 }} />
            <div style={{ width: 100, height: 100, background: 'repeating-conic-gradient(#0a0f1e 0% 25%, white 0% 50%) 0 0 / 10px 10px', borderRadius: 4 }} />
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
        <div style={{ padding: '1.25rem 1.75rem 1.75rem', background: 'white' }}>
          {rows.map(({ icon, label, value }) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '10px 0', borderBottom: '1px solid #f8fafc' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {icon}
                <span style={{ fontSize: 13, color: '#64748b', fontWeight: 600 }}>{label}</span>
              </div>
              <span style={{ fontSize: 13, fontWeight: 800, color: '#0a0f1e', textAlign: 'right', maxWidth: '55%' }}>{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Botones */}
      <div className="animate-fade-up delay-2" style={{ display: 'flex', gap: 10, marginTop: '1.25rem' }}>
        <Link href="/tiquetes" className="btn-ghost" style={{ flex: 1, justifyContent: 'center', padding: '12px', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
          <IconArrowLeft size={15} color="#475569" /> Mis tiquetes
        </Link>
        <Link href="/" className="btn-primary" style={{ flex: 1, justifyContent: 'center', padding: '12px', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
          Ver cartelera <IconArrowRight size={15} color="white" />
        </Link>
      </div>
    </div>
  )
}
