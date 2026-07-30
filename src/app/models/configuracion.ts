export class Configuracion {
  id!: number;
  nombre!: string;
  descripcion?: number;
  valor!: string;
  activo!: boolean;

  // Configuración de validaciones
  public static readonly campos = {
    nombre: { maxLength: 255 }
  };
}
