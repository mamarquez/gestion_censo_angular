export class Menu {
  id!: number;
  nombre!: string;
  descripcion?: string;
  enlace?: string;
  activo?: boolean;

  // Configuración de validaciones
  public static readonly campos = {
    id: { type: 'number' },
    nombre: { maxLength: 50 }
  };
}
