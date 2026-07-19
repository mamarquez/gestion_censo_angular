export class Provincia {
  id!: number;
  nombre!: string;
  activo!: boolean;

  // Configuración de validaciones
  public static readonly campos = {
    nombre: { maxLength: 75 }
  };
}
