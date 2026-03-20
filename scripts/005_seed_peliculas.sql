-- Seed sample movies
INSERT INTO public.peliculas (titulo, descripcion, duracion, genero, clasificacion, imagen_url, estado)
VALUES 
  ('Dune: Parte Dos', 'Paul Atreides se une a Chani y los Fremen mientras busca venganza contra los conspiradores que destruyeron a su familia.', 166, 'Ciencia Ficción', '+13', 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=400&h=600&fit=crop', 'activa'),
  ('Oppenheimer', 'La historia del físico J. Robert Oppenheimer y su papel en el desarrollo de la bomba atómica.', 180, 'Drama', '+16', 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=400&h=600&fit=crop', 'activa'),
  ('Spider-Man: Across the Spider-Verse', 'Miles Morales regresa para una aventura épica que transportará a Spider-Man a través del Multiverso.', 140, 'Animación', 'Todo Público', 'https://images.unsplash.com/photo-1635805737707-575885ab0820?w=400&h=600&fit=crop', 'activa'),
  ('Barbie', 'Barbie sufre una crisis que la lleva a cuestionar su mundo y su existencia.', 114, 'Comedia', 'Todo Público', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=600&fit=crop', 'activa'),
  ('Misión Imposible: Sentencia Mortal', 'Ethan Hunt y su equipo del IMF se embarcan en su misión más peligrosa hasta la fecha.', 163, 'Acción', '+13', 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400&h=600&fit=crop', 'activa'),
  ('El Exorcista: Creyente', 'Dos niñas desaparecen en el bosque y regresan tres días después sin recordar nada.', 111, 'Terror', '+18', 'https://images.unsplash.com/photo-1509248961895-b5c641b0a786?w=400&h=600&fit=crop', 'activa')
ON CONFLICT DO NOTHING;

-- Seed sample funciones for the movies
INSERT INTO public.funciones (pelicula_id, fecha, hora, precio, estado)
SELECT 
  p.id,
  CURRENT_DATE + (generate_series % 7),
  (ARRAY['14:00', '17:00', '20:00', '22:30'])[1 + (generate_series % 4)]::time,
  15000.00 + (generate_series % 3) * 2000,
  'disponible'
FROM public.peliculas p, generate_series(0, 11)
WHERE p.estado = 'activa';
