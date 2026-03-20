export type Pelicula = {
  id: string
  titulo: string
  descripcion: string
  duracion: number
  genero: string
  clasificacion: string
  imagen_url: string
  trailer_url?: string
  estado: 'activa' | 'inactiva'
  created_at: string
}

export type Funcion = {
  id: string
  pelicula_id: string
  fecha: string
  hora: string
  precio: number
  estado: 'disponible' | 'cancelada'
  created_at: string
  peliculas?: Pelicula
}

export type Asiento = {
  id: string
  numero: number
  fila: string
  columna: number
  estado: 'activo' | 'inactivo'
}

export type Tiquete = {
  id: string
  codigo: string
  usuario_id: string
  funcion_id: string
  fecha_compra: string
  total: number
  estado: 'activo' | 'usado' | 'cancelado'
  funciones?: Funcion & { peliculas?: Pelicula }
  detalle_tiquete?: DetalleTiquete[]
}

export type DetalleTiquete = {
  id: string
  tiquete_id: string
  asiento_id: string
  funcion_id: string
  precio_unitario: number
  asientos?: Asiento
}

export type Profile = {
  id: string
  nombre: string
  email: string
  rol: 'admin' | 'cliente'
  created_at: string
}
