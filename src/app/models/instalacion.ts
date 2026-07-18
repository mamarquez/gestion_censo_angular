export class Instalacion {
    id!: number;
    nombre!: string;
    nombre_popular?: string;
    direccion?: string;
    id_provincia!: number;
    id_municipio!: number;
    cp!: string;
    tlf_fijo?: string;
    tlf_movil?: string;
    fax?: string;
    email?: string;
    web?: string;
    visible?: boolean = false;
    observaciones?: string;
    baja?: boolean = false;
    motivo_baja?: string;
    id_usuario_alta!: number;
    grados_latitud?: number;
    minutos_latitud?: number;
    segundos_latitud?: number;
    grados_longitud?: number;
    minutos_longitud?: number;
    segundos_longitud?: number;
    altitud?: number;
    nmea_latitud?: string;
    nmea_longitud?: string;
    utm_coordenada_x?: string;
    utm_coordenada_y?: string;
    utm_huso?: string;
    utm_banda?: string;
    xy_x?: string;
    xy_y?: string;
    xy_z?: string;
    activo!: boolean;

  // Configuración de validaciones
  static campos = {
    nombre: { maxLength: 50 }
  };
}
