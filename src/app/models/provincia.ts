export class Provincia {
  id!: number;
  nombre!: string;
  activo!: boolean;

  // Configuración de validaciones
  static campos = {
    nombre: { maxLength: 75 }
  };
}
