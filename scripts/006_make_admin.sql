-- Ejecutar este script DESPUES de que el usuario se haya registrado
-- Reemplaza 'tu@email.com' con el email del usuario que quieres hacer admin

UPDATE public.profiles
SET rol = 'admin'
WHERE email = 'tu@email.com';

-- Verificar:
SELECT id, nombre, email, rol FROM public.profiles WHERE rol = 'admin';
