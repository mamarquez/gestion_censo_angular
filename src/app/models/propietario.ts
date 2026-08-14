export class Propietario {
  id!: number;
  nombre!: string;
  descripcion?: string;
  visible!: boolean;
  activo!: boolean;

  // Configuración de validaciones
  public static readonly campos = {
    nombre: { maxLength: 255 }
  };
}
