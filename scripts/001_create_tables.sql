-- Cinema Management System - Database Schema

-- Tabla de perfiles de usuario (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre TEXT,
  email TEXT,
  rol TEXT DEFAULT 'cliente',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de películas
CREATE TABLE IF NOT EXISTS public.peliculas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  descripcion TEXT,
  duracion INTEGER NOT NULL,
  genero TEXT NOT NULL,
  clasificacion TEXT NOT NULL,
  imagen_url TEXT,
  trailer_url TEXT,
  estado TEXT DEFAULT 'activa',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de funciones (proyecciones)
CREATE TABLE IF NOT EXISTS public.funciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pelicula_id UUID NOT NULL REFERENCES public.peliculas(id) ON DELETE CASCADE,
  fecha DATE NOT NULL,
  hora TIME NOT NULL,
  precio DECIMAL(10,2) NOT NULL,
  estado TEXT DEFAULT 'disponible',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de asientos (150 asientos fijos)
CREATE TABLE IF NOT EXISTS public.asientos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero INTEGER NOT NULL,
  fila TEXT NOT NULL,
  columna INTEGER NOT NULL,
  estado TEXT DEFAULT 'activo'
);

-- Tabla de tiquetes
CREATE TABLE IF NOT EXISTS public.tiquetes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo TEXT UNIQUE NOT NULL,
  usuario_id UUID REFERENCES auth.users(id),
  funcion_id UUID NOT NULL REFERENCES public.funciones(id) ON DELETE CASCADE,
  fecha_compra TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  total DECIMAL(10,2) NOT NULL,
  estado TEXT DEFAULT 'activo'
);

-- Tabla de detalle de tiquete (relación tiquete-asientos)
CREATE TABLE IF NOT EXISTS public.detalle_tiquete (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tiquete_id UUID NOT NULL REFERENCES public.tiquetes(id) ON DELETE CASCADE,
  asiento_id UUID NOT NULL REFERENCES public.asientos(id),
  funcion_id UUID NOT NULL REFERENCES public.funciones(id),
  precio_unitario DECIMAL(10,2) NOT NULL,
  UNIQUE(funcion_id, asiento_id)
);
