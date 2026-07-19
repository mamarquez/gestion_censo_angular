export class Menu {
  id!: number;
  nombre!: string;
  descripcion?: string;

  // Configuración de validaciones
  public static readonly campos = {
    nombre: { maxLength: 50 }
  };
}
