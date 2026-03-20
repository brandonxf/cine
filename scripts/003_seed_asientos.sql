-- Seed 150 seats: 10 rows (A-J) x 15 columns
-- Clear existing seats first
DELETE FROM public.asientos;

-- Generate 150 seats
INSERT INTO public.asientos (numero, fila, columna)
SELECT 
  ROW_NUMBER() OVER () as numero,
  chr(65 + ((ROW_NUMBER() OVER () - 1) / 15)::integer) as fila,
  ((ROW_NUMBER() OVER () - 1) % 15) + 1 as columna
FROM generate_series(1, 150);
