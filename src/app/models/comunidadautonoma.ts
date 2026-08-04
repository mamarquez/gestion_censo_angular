export class ComunidadAutonoma {
  id?: number;
  codigo!: string;
  nombre!: string;
  activo!: boolean;

  // Configuración de validaciones
  public static readonly campos = {
    codigo: { minLength: 2, maxLength: 2 },
    nombre: { maxLength: 50 }
  };
}
