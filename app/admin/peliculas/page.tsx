import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PeliculasAdmin } from '@/components/admin/peliculas-admin'

export default async function AdminPeliculasPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  if (profile?.rol !== 'admin') redirect('/')
  const { data: peliculas } = await supabase.from('peliculas').select('*').order('created_at', { ascending: false })
  return <PeliculasAdmin peliculas={peliculas || []} />
}
