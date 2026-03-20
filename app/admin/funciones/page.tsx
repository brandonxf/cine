import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { FuncionesAdmin } from '@/components/admin/funciones-admin'

export default async function AdminFuncionesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  if (profile?.rol !== 'admin') redirect('/')
  const { data: funciones } = await supabase.from('funciones').select('*, peliculas(titulo)').order('fecha', { ascending: false }).order('hora')
  const { data: peliculas } = await supabase.from('peliculas').select('id, titulo').eq('estado', 'activa').order('titulo')
  return <FuncionesAdmin funciones={funciones || []} peliculas={peliculas || []} />
}
