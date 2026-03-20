-- Crear usuario admin@cine.com con password admin123
-- Ejecutar en: Supabase → SQL Editor

DO $$
DECLARE
  new_user_id uuid;
BEGIN
  -- Solo crear si no existe
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'admin@cine.com') THEN
    new_user_id := gen_random_uuid();

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
      new_user_id,
      '00000000-0000-0000-0000-000000000000',
      'admin@cine.com',
      crypt('admin123', gen_salt('bf')),
      NOW(),
      '{"nombre": "Admin"}',
      NOW(),
      NOW(),
      'authenticated',
      'authenticated'
    );

    -- Crear perfil admin
    INSERT INTO public.profiles (id, nombre, email, rol)
    VALUES (new_user_id, 'Admin', 'admin@cine.com', 'admin');

    RAISE NOTICE 'Usuario admin creado con ID: %', new_user_id;
  ELSE
    -- Si ya existe, solo asegurarse que sea admin
    UPDATE public.profiles SET rol = 'admin', nombre = 'Admin'
    WHERE email = 'admin@cine.com';

    RAISE NOTICE 'Usuario ya existia, actualizado a admin';
  END IF;
END $$;

-- Verificar resultado
SELECT u.email, p.rol, p.nombre
FROM auth.users u
JOIN public.profiles p ON p.id = u.id
WHERE u.email = 'admin@cine.com';
