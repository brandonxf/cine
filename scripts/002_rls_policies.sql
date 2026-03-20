-- Row Level Security Policies for Cinema Management System

-- Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "profiles_read_all" ON public.profiles;
CREATE POLICY "profiles_read_all" ON public.profiles FOR SELECT USING (true);
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id);
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Peliculas (público para lectura, admin para escritura)
ALTER TABLE public.peliculas ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "peliculas_read_all" ON public.peliculas;
CREATE POLICY "peliculas_read_all" ON public.peliculas FOR SELECT USING (true);
DROP POLICY IF EXISTS "peliculas_admin_insert" ON public.peliculas;
CREATE POLICY "peliculas_admin_insert" ON public.peliculas FOR INSERT 
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND rol = 'admin'));
DROP POLICY IF EXISTS "peliculas_admin_update" ON public.peliculas;
CREATE POLICY "peliculas_admin_update" ON public.peliculas FOR UPDATE 
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND rol = 'admin'));
DROP POLICY IF EXISTS "peliculas_admin_delete" ON public.peliculas;
CREATE POLICY "peliculas_admin_delete" ON public.peliculas FOR DELETE 
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND rol = 'admin'));

-- Funciones
ALTER TABLE public.funciones ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "funciones_read_all" ON public.funciones;
CREATE POLICY "funciones_read_all" ON public.funciones FOR SELECT USING (true);
DROP POLICY IF EXISTS "funciones_admin_insert" ON public.funciones;
CREATE POLICY "funciones_admin_insert" ON public.funciones FOR INSERT 
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND rol = 'admin'));
DROP POLICY IF EXISTS "funciones_admin_update" ON public.funciones;
CREATE POLICY "funciones_admin_update" ON public.funciones FOR UPDATE 
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND rol = 'admin'));

-- Asientos
ALTER TABLE public.asientos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "asientos_read_all" ON public.asientos;
CREATE POLICY "asientos_read_all" ON public.asientos FOR SELECT USING (true);

-- Tiquetes
ALTER TABLE public.tiquetes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tiquetes_read_own" ON public.tiquetes;
CREATE POLICY "tiquetes_read_own" ON public.tiquetes FOR SELECT 
  USING (usuario_id = auth.uid() OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND rol = 'admin'));
DROP POLICY IF EXISTS "tiquetes_insert_authenticated" ON public.tiquetes;
CREATE POLICY "tiquetes_insert_authenticated" ON public.tiquetes FOR INSERT 
  WITH CHECK (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "tiquetes_update_admin" ON public.tiquetes;
CREATE POLICY "tiquetes_update_admin" ON public.tiquetes FOR UPDATE 
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND rol = 'admin'));

-- Detalle tiquete
ALTER TABLE public.detalle_tiquete ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "detalle_read_all" ON public.detalle_tiquete;
CREATE POLICY "detalle_read_all" ON public.detalle_tiquete FOR SELECT USING (true);
DROP POLICY IF EXISTS "detalle_insert_authenticated" ON public.detalle_tiquete;
CREATE POLICY "detalle_insert_authenticated" ON public.detalle_tiquete FOR INSERT 
  WITH CHECK (auth.uid() IS NOT NULL);
