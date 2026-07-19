export class Municipio {
  id!: number;
  ine!: string;
  nombre!: string;
  activo!: boolean;

  // Configuración de validaciones
  public static readonly campos = {
    ine: { maxLength: 5 },
    nombre: { maxLength: 50 }
  };
}
