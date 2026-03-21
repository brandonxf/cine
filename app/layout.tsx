import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import { Navbar } from '@/components/navbar'

export const metadata: Metadata = {
  title: 'CineApp — Tu cine digital',
  description: 'Compra tus tiquetes de cine en segundos',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <Navbar />
        <main>{children}</main>
        <Analytics />
      </body>
    </html>
  )
}
