export class Menu {
  id!: number;
  nombre!: string;
  descripcion?: string;
  activo?: boolean;

  // Configuración de validaciones
  public static readonly campos = {
    nombre: { maxLength: 50 }
  };
}
