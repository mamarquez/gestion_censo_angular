export class Provincia {
  id!: number;
  ine!: string;
  nombre!: string;
  activo!: boolean;

  // Configuración de validaciones
  public static readonly campos = {
    ine: {minLength: 2, maxLength: 2},
    nombre: { maxLength: 75 }
  };
}
