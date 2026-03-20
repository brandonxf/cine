-- Crear usuario admin@cine.com con password admin123
-- Ejecutar en: Supabase → SQL Editor

INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_user_meta_data,
  created_at,
  updated_at,
  role,
  aud
) VALUES (
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000',
  'admin@cine.com',
  crypt('admin123', gen_salt('bf')),
  NOW(),
  '{"nombre": "Admin"}',
  NOW(),
  NOW(),
  'authenticated',
  'authenticated'
)
ON CONFLICT (email) DO NOTHING;

-- Actualizar el perfil a rol admin
UPDATE public.profiles
SET rol = 'admin', nombre = 'Admin'
WHERE email = 'admin@cine.com';

-- Verificar
SELECT id, email, email_confirmed_at FROM auth.users WHERE email = 'admin@cine.com';
SELECT id, email, rol FROM public.profiles WHERE email = 'admin@cine.com';
