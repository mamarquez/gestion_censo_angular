export class Rol {
  id!: number;
  nombre!: string;
  descripcion?: string;
  activo!: boolean;

  // Configuración de validaciones
  static campos = {
    nombre: { maxLength: 255 }
  };
}
