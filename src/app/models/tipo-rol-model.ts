export class TipoRolModel {
  id!: number;
  nombre!: string;

  // Configuración de validaciones
  public static readonly campos = {
    nombre: { maxLength: 50 }
  };
}
