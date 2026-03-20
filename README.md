# 🎬 CineApp — Sistema de Gestión de Cine

Aplicación web completa para gestión de cartelera y venta de tiquetes de cine, desarrollada con **Next.js 16**, **Supabase** y **TypeScript**.

---

## 🚀 Stack tecnológico

| Capa | Tecnología |
|------|-----------|
| Frontend | Next.js 16 (App Router), React 19, TypeScript |
| UI | Tailwind CSS 4, estilos inline (tema oscuro) |
| Backend | Supabase (PostgreSQL + Auth + RLS) |
| Deploy | Vercel |

---

## 📋 Módulos implementados

- **Cartelera pública** — lista de películas activas con poster, género y clasificación
- **Detalle de película** — descripción, duración, funciones agrupadas por fecha
- **Selección de asientos** — grid visual 10×15 (150 sillas), estados disponible/ocupado/seleccionado
- **Compra de tiquetes** — código único generado, prevención de doble venta con UNIQUE constraint
- **Mis tiquetes** — historial por usuario con detalle y código QR simulado
- **Validación de tiquetes** — ingresa el código, marca como "usado" al validar
- **Panel admin** — dashboard con gráficas, CRUD de películas y funciones, vista de ventas

---

## ⚙️ Variables de entorno

Crea un archivo `.env.local` en la raíz:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_xxxx
```

En **Vercel**: Settings → Environment Variables → agregar las mismas dos variables → Redeploy.

---

## 🗄️ Configuración de base de datos

Ejecuta los scripts en orden desde el **SQL Editor de Supabase**:

```
scripts/001_create_tables.sql   — Tablas principales
scripts/002_rls_policies.sql    — Políticas de seguridad RLS
scripts/003_seed_asientos.sql   — 150 asientos (A1–J15)
scripts/004_profile_trigger.sql — Trigger auto-crear perfil al registrarse
scripts/005_seed_peliculas.sql  — Películas y funciones de ejemplo
```

---

## 👑 Crear usuario administrador

1. Regístrate normalmente en la app
2. En el **SQL Editor de Supabase**, ejecuta:

```sql
UPDATE public.profiles
SET rol = 'admin'
WHERE email = 'tu@email.com';
```

3. Recarga la página — aparecerá el menú "Admin" en la navbar

---

## 🗺️ Rutas de la aplicación

| Ruta | Descripción |
|------|-------------|
| `/` | Cartelera pública |
| `/pelicula/[id]` | Detalle de película y funciones |
| `/funcion/[id]` | Selección de asientos y compra |
| `/tiquetes` | Mis tiquetes (requiere login) |
| `/tiquetes/[id]` | Detalle y código del tiquete |
| `/validar` | Validador de tiquetes |
| `/auth/login` | Inicio de sesión |
| `/auth/registro` | Registro de usuario |
| `/admin` | Dashboard administrativo |
| `/admin/peliculas` | CRUD de películas |
| `/admin/funciones` | CRUD de funciones |
| `/admin/tiquetes` | Vista de todas las ventas |

---

## 🔒 Seguridad

- Row Level Security (RLS) activado en todas las tablas
- Solo admins pueden crear/editar/eliminar películas y funciones
- Los tiquetes solo los ve su dueño (o un admin)
- Constraint `UNIQUE(funcion_id, asiento_id)` evita doble venta a nivel de base de datos

---

## 👥 Equipo SENA CNCA – Nodo Tic ADSO17
