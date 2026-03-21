'use client'
import Link from 'next/link'
import type { Funcion } from '@/lib/supabase/types'
import { IconClock, IconMoney } from './icons'

export function FuncionCard({ funcion }: { funcion: Funcion }) {
  return (
    <Link href={`/funcion/${funcion.id}`} style={{ textDecoration: 'none' }}>
      <div
        style={{ background: 'white', borderRadius: 14, padding: '14px 20px', textAlign: 'center', cursor: 'pointer', border: '2px solid #e2e8f0', transition: 'all 0.2s', minWidth: 100 }}
        onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = '#2563eb'; el.style.background = '#eff6ff'; el.style.transform = 'translateY(-2px)' }}
        onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = '#e2e8f0'; el.style.background = 'white'; el.style.transform = 'translateY(0)' }}
      >
        <div style={{ fontWeight: 900, fontSize: 22, color: '#0a0f1e', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
          <IconClock size={14} color="#94a3b8" />
          {funcion.hora.slice(0, 5)}
        </div>
        <div style={{ fontSize: 12, color: '#2563eb', fontWeight: 700, marginTop: 5, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
          ${Number(funcion.precio).toLocaleString('es-CO')}
        </div>
      </div>
    </Link>
  )
}
